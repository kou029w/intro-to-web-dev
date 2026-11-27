# M5Stack (UIFlow2) 用 USBシリアル ブリッジ
#
# 対応機種: M5Stack Core2（Core2 for AWS を含む）、M5Stack Basic
#
# - 内蔵センサー（IMU、バッテリー）と ENV III（温度、湿度）の値を1行1JSONで送信する
# - 受信した1行のテキストコマンドで、GPIOにつないだサーボモーターをPWMで直接動かす
# - IMU や ENV III が無い・外れている場合も止まらず、その値を null にして送信を続ける
#
# 受信コマンド（改行区切り）:
#   ping                 生存確認（つながっている部品の状態も返す）
#   servo <ch> <deg> ... サーボの角度を指定（例: servo 0 90 1 45）
#   release [<ch> ...]   サーボの出力を止めて脱力させる（省略時は全チャンネル）
#   sensor on|off        センサー値の送信を開始・停止する
#   sensor <ms>          センサー値の送信間隔をミリ秒で指定する
#   help                 コマンド一覧を返す
#   menu                 UIFlow2 の起動メニューを表示するように戻して再起動する
#
# 起動直後（画面に「Tap A」と出ている2秒間）にボタンAをタップしても、起動メニューに戻る
#
# 送信メッセージ（1行1JSON）:
#   {"type": "ready", ...}   起動完了
#   {"type": "sensor", ...}  センサー値
#   {"type": "button", ...}  画面下のボタンが押された
#   {"type": "ok", ...}      コマンドの実行結果
#   {"type": "error", ...}   コマンドのエラー

import M5
import json
import select
import sys
import time
from machine import I2C, PWM, Pin

# 機種ごとのピン配置
#   i2c:   ENV III をつなぐ Port A（赤いGrove端子）の SDA / SCL
#   servo: チャンネル番号の順に並べた、サーボの信号線をつなぐ GPIO
BOARDS = {
    # Port A: G32/G33、サーボ: Port B の G26、Port C の G14（Core2 for AWS の底面ユニット）
    "core2": {"i2c": (32, 33), "servo": (26, 14)},
    # Port A: G21/G22、サーボ: 本体側面のピンソケットの G26 と G5
    # Basic の Port A は、電源IC（IP5306、0x75）と同じI2Cバスにつながっている
    "basic": {"i2c": (21, 22), "servo": (26, 5)},
}
# 機種の自動判別がうまくいかないときは、"core2" か "basic" を指定する
BOARD = None

# サーボモーターのパルス幅（SG90などのマイクロサーボ向け）
# 端まで回らない、端でうなるときは、自分のサーボに合わせて書き換える
SERVO_MIN_US = 500
SERVO_MAX_US = 2400
SERVO_FREQ = 50

# ENV III の温湿度センサー（SHT30）
SHT30_ADDRESS = 0x44
ENV_INTERVAL_MS = 1000   # 温湿度の計測間隔
ENV_MEASURE_MS = 20      # 計測の開始から結果が読めるまでの待ち時間
ENV_RETRY_MS = 2000      # 見つからないときに探し直す間隔

SENSOR_INTERVAL_MS = 100
DRAW_INTERVAL_MS = 200
MENU_WINDOW_MS = 2000    # 起動直後にボタンAを受け付ける時間


def send(message):
    print(json.dumps(message))


def detect_board():
    if BOARD in BOARDS:
        return BOARD
    try:
        kind = M5.getBoard()
        if kind == M5.BOARD.M5StackCore2:
            return "core2"
        if kind == M5.BOARD.M5Stack:
            return "basic"
    except Exception:
        pass
    # Core2 の G5 と Basic の G14 は画面の配線に使われているため、
    # 機種がわからないまま片方のピン配置を当てはめるわけにはいかない
    return None


class Servo:
    """1本のGPIOから、サーボモーター用のPWM信号を出す"""

    def __init__(self, pin):
        self.pin = pin
        self.pwm = None

    def write_us(self, us):
        # duty() は分解能が粗く、動きがカクつくため、パルス幅をナノ秒で指定する
        ns = int(us * 1000)
        if self.pwm is not None:
            try:
                self.pwm.duty_ns(ns)
                return
            except ValueError:
                # ファームウェアによっては、PWMが無効（PWM is inactive）になっていることがある。
                # そのときは作り直す
                self._deinit()
        # 起動直後にサーボが跳ねないよう、最初に角度を指定されるまでPWMを作らない。
        # MicroPython 1.27 では、PWM() に duty_ns を渡すと PWM is inactive になる。
        # 省略すると duty 50% で出力が始まってしまうため、duty_u16=0 で作ってから
        # パルス幅を設定する
        self.pwm = PWM(Pin(self.pin), freq=SERVO_FREQ, duty_u16=0)
        self.pwm.duty_ns(ns)

    def release(self):
        # duty を0にするのではなく、PWMを止めて信号線をただのピンに戻す
        self._deinit()

    def _deinit(self):
        if self.pwm is not None:
            try:
                self.pwm.deinit()
            except Exception:
                pass
            self.pwm = None


class Env:
    """ENV III の SHT30 を、メインループを止めずに読む

    計測の開始と結果の読み出しを別々の呼び出しに分け、待ち時間に sleep を使わない。
    途中で外れたり、値が壊れていたりした場合は、値を None に戻して探し直す。
    """

    def __init__(self, i2c):
        self.i2c = i2c
        self.connected = False
        try:
            self.connected = SHT30_ADDRESS in i2c.scan()
        except Exception:
            pass
        self.value = None
        self.measuring = False
        self.next_ms = time.ticks_ms()

    def poll(self, now):
        if time.ticks_diff(now, self.next_ms) < 0:
            return
        try:
            if not self.connected:
                self.connected = SHT30_ADDRESS in self.i2c.scan()
                if not self.connected:
                    self.next_ms = time.ticks_add(now, ENV_RETRY_MS)
                    return
            if not self.measuring:
                # 単発計測・高精度・クロックストレッチなし
                self.i2c.writeto(SHT30_ADDRESS, b"\x24\x00")
                self.measuring = True
                self.next_ms = time.ticks_add(now, ENV_MEASURE_MS)
                return
            self.measuring = False
            self.value = self._parse(self.i2c.readfrom(SHT30_ADDRESS, 6))
            self.next_ms = time.ticks_add(now, ENV_INTERVAL_MS)
        except Exception:
            # 抜き差しの途中などで通信に失敗した。次の機会に探し直す
            self.connected = False
            self.measuring = False
            self.value = None
            self.next_ms = time.ticks_add(now, ENV_RETRY_MS)

    def _parse(self, data):
        if crc8(data[0:2]) != data[2] or crc8(data[3:5]) != data[5]:
            raise ValueError("CRC mismatch")
        t_raw = data[0] << 8 | data[1]
        h_raw = data[3] << 8 | data[4]
        return {
            "temperature": round(-45 + 175 * t_raw / 65535, 1),
            "humidity": round(100 * h_raw / 65535, 1),
        }


def crc8(data):
    crc = 0xFF
    for byte in data:
        crc ^= byte
        for _ in range(8):
            crc = ((crc << 1) ^ 0x31) & 0xFF if crc & 0x80 else (crc << 1) & 0xFF
    return crc


def has_imu():
    try:
        return bool(M5.Imu.isEnabled())
    except AttributeError:
        pass
    except Exception:
        return False
    # isEnabled() が無いファームウェアでは、試しに読んでみる。
    # 静止していても重力の分だけ値が出るので、すべて0ならIMUは無いとみなす
    try:
        return any(M5.Imu.getAccel())
    except Exception:
        return False


def angle_to_us(angle):
    return SERVO_MIN_US + (SERVO_MAX_US - SERVO_MIN_US) * angle / 180


def open_menu():
    # 「RUN (ALWAYS)」で 2 になった起動設定を、UIFlow2 の初期値（1: 起動メニューを表示）に戻して再起動する
    import esp32
    import machine
    nvs = esp32.NVS("uiflow")
    nvs.set_u8("boot_option", 1)
    nvs.commit()
    machine.reset()


def menu_requested():
    # 起動直後にボタンAがタップされたら、UIFlow2 の起動メニューに戻る
    # Core2 のボタンはタッチパネルの一部で、電源を入れる前から触れていた指は押下として検出されないため、
    # 押し続けるのではなく、表示が出てからタップしてもらう
    M5.Lcd.print("Tap A: UIFlow menu\n")
    start = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), start) < MENU_WINDOW_MS:
        M5.update()
        if M5.BtnA.isPressed():
            return True
        time.sleep_ms(10)
    return False


M5.begin()
M5.Lcd.setTextSize(2)
if menu_requested():
    open_menu()

board = detect_board()
env = None
if board:
    config = BOARDS[board]
    sda, scl = config["i2c"]
    try:
        env = Env(I2C(0, scl=Pin(scl), sda=Pin(sda), freq=100000))
    except Exception:
        pass
    servos = [Servo(pin) for pin in config["servo"]]
else:
    # どちらの機種でも安全な G26 だけを使い、ENV III は読まない
    board = "unknown"
    servos = [Servo(26)]
imu = has_imu()

angles = {}
sensor_enabled = True
sensor_interval_ms = SENSOR_INTERVAL_MS
last_command = "-"
dirty = True


def status():
    return {
        "board": board,
        "servo": True,
        "channels": len(servos),
        "imu": imu,
        "env": env is not None and env.connected,
    }


def draw():
    M5.Lcd.clear(0x000000)
    M5.Lcd.setCursor(0, 0)
    M5.Lcd.print("Serial Bridge (" + board + ")\n\n")
    M5.Lcd.print("IMU: " + ("OK" if imu else "-") + "\n")
    value = env.value if env else None
    if value:
        M5.Lcd.print("ENV: " + str(value["temperature"]) + "C " + str(value["humidity"]) + "%\n")
    else:
        M5.Lcd.print("ENV: -\n")
    M5.Lcd.print("sensor: " + (str(sensor_interval_ms) + "ms" if sensor_enabled else "off") + "\n\n")
    for channel in sorted(angles):
        M5.Lcd.print("ch" + str(channel) + " (G" + str(servos[channel].pin) + "): " + str(angles[channel]) + "\n")
    M5.Lcd.print("\n> " + last_command[:20] + "\n")


def parse_channel(text):
    channel = int(text)
    if not 0 <= channel < len(servos):
        raise ValueError("channel out of range: " + str(channel))
    return channel


def command_servo(args):
    if len(args) == 0 or len(args) % 2 != 0:
        raise ValueError("usage: servo <ch> <deg> ...")
    targets = {}
    for i in range(0, len(args), 2):
        channel = parse_channel(args[i])
        angle = int(args[i + 1])
        if not 0 <= angle <= 180:
            raise ValueError("angle out of range: " + str(angle))
        targets[channel] = angle
    # 範囲外の値を含むコマンドは、1つも動かさずに拒否する
    for channel, angle in targets.items():
        servos[channel].write_us(angle_to_us(angle))
        angles[channel] = angle
    # JSONのキーは文字列にしておく
    return {"servo": {str(channel): angle for channel, angle in targets.items()}}


def command_release(args):
    channels = [parse_channel(arg) for arg in args] or list(range(len(servos)))
    for channel in channels:
        servos[channel].release()
        angles.pop(channel, None)
    return {"released": channels}


def command_sensor(args):
    global sensor_enabled, sensor_interval_ms
    if len(args) != 1:
        raise ValueError("usage: sensor on|off|<ms>")
    if args[0] == "on":
        sensor_enabled = True
    elif args[0] == "off":
        sensor_enabled = False
    else:
        sensor_interval_ms = max(20, int(args[0]))
        sensor_enabled = True
    return {"enabled": sensor_enabled, "interval": sensor_interval_ms}


COMMANDS = {
    "ping": lambda args: status(),
    "servo": command_servo,
    "release": command_release,
    "sensor": command_sensor,
    "help": lambda args: {"commands": sorted(COMMANDS)},
}


def command_menu(args):
    # 応答を返してから再起動する
    send({"type": "ok", "command": "menu"})
    time.sleep_ms(100)
    open_menu()


COMMANDS["menu"] = command_menu


def handle(line):
    global last_command, dirty
    words = line.split()
    name = words[0]
    last_command = line
    try:
        if name not in COMMANDS:
            raise ValueError("unknown command: " + name)
        result = COMMANDS[name](words[1:])
        result["type"] = "ok"
        result["command"] = name
        send(result)
    except Exception as error:
        send({"type": "error", "command": name, "message": str(error)})
    # 画面の描画は時間がかかるため、ここでは描き直しの予約だけをする
    dirty = True


poller = select.poll()
poller.register(sys.stdin, select.POLLIN)
buffer = ""


def read_lines():
    global buffer
    lines = []
    while poller.poll(0):
        char = sys.stdin.read(1)
        if char in ("\n", "\r"):
            if buffer:
                lines.append(buffer.strip())
            buffer = ""
        elif len(buffer) < 200:
            buffer += char
    return lines


def read_imu():
    if not imu:
        return None, None
    try:
        ax, ay, az = M5.Imu.getAccel()
        gx, gy, gz = M5.Imu.getGyro()
    except Exception:
        return None, None
    return [round(ax, 3), round(ay, 3), round(az, 3)], [round(gx, 1), round(gy, 1), round(gz, 1)]


def read_battery():
    try:
        return M5.Power.getBatteryLevel(), M5.Power.isCharging()
    except Exception:
        return None, None


def send_sensor():
    accel, gyro = read_imu()
    battery, charging = read_battery()
    send({
        "type": "sensor",
        "time": time.ticks_ms(),
        "accel": accel,
        "gyro": gyro,
        "env": env.value if env else None,
        "battery": battery,
        "charging": charging,
    })


ready = status()
ready["type"] = "ready"
send(ready)
last_sent = time.ticks_ms()
last_drawn = last_sent
env_shown = None

while True:
    try:
        M5.update()

        for line in read_lines():
            if line:
                handle(line)

        for name, button in (("A", M5.BtnA), ("B", M5.BtnB), ("C", M5.BtnC)):
            if button.wasPressed():
                send({"type": "button", "name": name})

        now = time.ticks_ms()
        if env:
            env.poll(now)
            if env.value != env_shown:
                env_shown = env.value
                dirty = True

        if sensor_enabled and time.ticks_diff(now, last_sent) >= sensor_interval_ms:
            send_sensor()
            last_sent = now

        if dirty and time.ticks_diff(now, last_drawn) >= DRAW_INTERVAL_MS:
            draw()
            dirty = False
            last_drawn = now
    except KeyboardInterrupt:
        # Ctrl-C でプログラムを止め、REPLに戻れるようにしておく
        raise
    except Exception as error:
        # 想定外のエラーでもブリッジを止めず、ブラウザーに知らせて動き続ける
        send({"type": "error", "command": "-", "message": str(error)})
        time.sleep_ms(100)

    time.sleep_ms(5)
