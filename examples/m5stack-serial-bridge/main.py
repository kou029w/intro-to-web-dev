# M5Stack Core2 (UIFlow2) 用 USBシリアル ブリッジ
#
# - 内蔵センサー（IMU、バッテリー）の値を1行1JSONで送信する
# - 受信した1行のテキストコマンドで、PCA9685に接続したサーボモーターを動かす
#
# 受信コマンド（改行区切り）:
#   ping                 生存確認（PCA9685の有無も返す）
#   servo <ch> <deg> ... サーボの角度を指定（例: servo 0 90 1 45）
#   release [<ch> ...]   サーボの出力を止めて脱力させる（省略時は全チャンネル）
#   sensor on|off        センサー値の送信を開始・停止する
#   sensor <ms>          センサー値の送信間隔をミリ秒で指定する
#   help                 コマンド一覧を返す
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
from machine import I2C, Pin

# PCA9685を接続するI2Cのピン（Core2のPort A）
I2C_SDA = 32
I2C_SCL = 33
PCA9685_ADDRESS = 0x40

# サーボモーターのパルス幅（SG90などのマイクロサーボ向け）
SERVO_MIN_US = 500
SERVO_MAX_US = 2400
SERVO_CHANNELS = 16

SENSOR_INTERVAL_MS = 100
DRAW_INTERVAL_MS = 200


class PCA9685:
    MODE1 = 0x00
    PRESCALE = 0xFE
    LED0_ON_L = 0x06

    def __init__(self, i2c, address=PCA9685_ADDRESS):
        self.i2c = i2c
        self.address = address
        self._write(self.MODE1, 0x00)
        self.set_freq(50)

    def _write(self, register, value):
        self.i2c.writeto_mem(self.address, register, bytes([value]))

    def _read(self, register):
        return self.i2c.readfrom_mem(self.address, register, 1)[0]

    def set_freq(self, freq):
        self.freq = freq
        prescale = int(25000000 / (4096 * freq) + 0.5) - 1
        mode = self._read(self.MODE1)
        # プリスケーラーはスリープ中にしか書き換えられない
        self._write(self.MODE1, (mode & 0x7F) | 0x10)
        self._write(self.PRESCALE, prescale)
        self._write(self.MODE1, mode)
        time.sleep_us(500)
        # 再起動し、レジスタの自動インクリメントを有効にする
        self._write(self.MODE1, mode | 0xA0)

    def set_pwm(self, channel, on, off):
        data = bytes([on & 0xFF, on >> 8, off & 0xFF, off >> 8])
        self.i2c.writeto_mem(self.address, self.LED0_ON_L + 4 * channel, data)

    def set_pulse_us(self, channel, us):
        period_us = 1000000 / self.freq
        self.set_pwm(channel, 0, int(us * 4096 / period_us))

    def release(self, channel):
        # OFFレジスタの上位ビット（full off）を立てて出力を止める
        self.set_pwm(channel, 0, 0x1000)


def angle_to_us(angle):
    return SERVO_MIN_US + (SERVO_MAX_US - SERVO_MIN_US) * angle / 180


def send(message):
    print(json.dumps(message))


M5.begin()
M5.Lcd.setTextSize(2)

i2c = I2C(0, scl=Pin(I2C_SCL), sda=Pin(I2C_SDA), freq=400000)
pca = None
if PCA9685_ADDRESS in i2c.scan():
    pca = PCA9685(i2c)

angles = {}
sensor_enabled = True
sensor_interval_ms = SENSOR_INTERVAL_MS
last_command = "-"
dirty = True


def draw():
    M5.Lcd.clear(0x000000)
    M5.Lcd.setCursor(0, 0)
    M5.Lcd.print("Serial Bridge\n\n")
    M5.Lcd.print("PCA9685: " + ("OK" if pca else "not found") + "\n")
    M5.Lcd.print("sensor: " + (str(sensor_interval_ms) + "ms" if sensor_enabled else "off") + "\n\n")
    for channel in sorted(angles):
        M5.Lcd.print("ch" + str(channel) + ": " + str(angles[channel]) + "\n")
    M5.Lcd.print("\n> " + last_command[:20] + "\n")


def command_servo(args):
    if pca is None:
        raise ValueError("PCA9685 not found")
    if len(args) == 0 or len(args) % 2 != 0:
        raise ValueError("usage: servo <ch> <deg> ...")
    targets = {}
    for i in range(0, len(args), 2):
        channel = int(args[i])
        angle = int(args[i + 1])
        if not 0 <= channel < SERVO_CHANNELS:
            raise ValueError("channel out of range: " + str(channel))
        if not 0 <= angle <= 180:
            raise ValueError("angle out of range: " + str(angle))
        targets[channel] = angle
    # 範囲外の値を含むコマンドは、1つも動かさずに拒否する
    for channel, angle in targets.items():
        pca.set_pulse_us(channel, angle_to_us(angle))
        angles[channel] = angle
    # JSONのキーは文字列にしておく
    return {"servo": {str(channel): angle for channel, angle in targets.items()}}


def command_release(args):
    if pca is None:
        raise ValueError("PCA9685 not found")
    channels = [int(arg) for arg in args] or list(range(SERVO_CHANNELS))
    for channel in channels:
        pca.release(channel)
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
    "ping": lambda args: {"servo": pca is not None},
    "servo": command_servo,
    "release": command_release,
    "sensor": command_sensor,
    "help": lambda args: {"commands": sorted(COMMANDS)},
}


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


def send_sensor():
    ax, ay, az = M5.Imu.getAccel()
    gx, gy, gz = M5.Imu.getGyro()
    send({
        "type": "sensor",
        "time": time.ticks_ms(),
        "accel": [round(ax, 3), round(ay, 3), round(az, 3)],
        "gyro": [round(gx, 1), round(gy, 1), round(gz, 1)],
        "battery": M5.Power.getBatteryLevel(),
        "charging": M5.Power.isCharging(),
    })


send({"type": "ready", "servo": pca is not None, "channels": SERVO_CHANNELS})
last_sent = time.ticks_ms()
last_drawn = last_sent

while True:
    M5.update()

    for line in read_lines():
        if line:
            handle(line)

    for name, button in (("A", M5.BtnA), ("B", M5.BtnB), ("C", M5.BtnC)):
        if button.wasPressed():
            send({"type": "button", "name": name})

    now = time.ticks_ms()
    if sensor_enabled and time.ticks_diff(now, last_sent) >= sensor_interval_ms:
        send_sensor()
        last_sent = now

    if dirty and time.ticks_diff(now, last_drawn) >= DRAW_INTERVAL_MS:
        draw()
        dirty = False
        last_drawn = now

    time.sleep_ms(5)
