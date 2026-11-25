# M5Stack USBシリアル ブリッジ

M5Stack（UIFlow2）で動かすMicroPythonプログラムです。
M5Stack Core2（Core2 for AWSを含む）とM5Stack Basicに対応しています。
USBシリアルを通じて、ブラウザとM5Stackのあいだで次の2つをやり取りします。

- M5Stackからブラウザへ：内蔵センサー（加速度、角速度、バッテリー）とENV Ⅲ（温度、湿度）の値、画面下のボタンの押下
- ブラウザからM5Stackへ：GPIOにつないだサーボモーター（2チャンネル）の角度

IMUの無い機種や、ENV Ⅲをつないでいない場合も、ブリッジは止まりません。
読めなかった値を`null`にして送信を続けます。
ENV Ⅲは動いている途中で抜き差ししても、2秒ほどで自動的に読み直します。

## 書き込み方

1. M5Burnerで、M5StackにUIFlow2ファームウェアを書き込みます
2. [UIFlow2](https://uiflow2.m5stack.com/)を開き、デバイスに使う機種を選んでUSB（WebTerminal）で接続します
3. Pythonのタブに`main.py`の内容を貼り付け、「Run Always」を押してデバイスに保存します

機種は起動時に自動で判別します。
画面の1行目が`Serial Bridge (unknown)`になった場合は、`main.py`の`BOARD`に`"core2"`か`"basic"`を指定してください。
判別できないあいだは、どちらの機種でも安全なG26（チャンネル0）だけを使い、ENV Ⅲは読みません。

詳しい手順は [M5Stack Core2の準備](../../src/web-serial/m5stack-setup.md) を参照してください。

`mpremote`やThonnyなど、UIFlow2以外の道具で書き込む場合は、`/flash/main.py`に置きます。
`/flash/apps/`はスタートアップメニューから選んで起動するアプリの置き場所で、ここに置いただけでは電源を入れても自動では起動しません。
起動時にメニューを出さずに`main.py`を実行させるには、REPLで次のように`boot_option`を`0`にします。

```python
import esp32
nvs = esp32.NVS("uiflow")
nvs.set_u8("boot_option", 0)
nvs.commit()
```

このように書き込んだあとで、同じデバイスにUIFlow2のWebから接続しないでください。
UIFlow2のWebは、ブラウザーで開いているプロジェクトの内容でデバイスのファイルを管理しています。
接続してDownloadなどを行うと、プロジェクトに含まれない`main.py`が消えたり、`boot_option`が`2`に書き換わったりすることがあります。
UIFlow2のWebも使いたい場合は、上の手順3のとおりPythonのタブに`main.py`を貼り付けて保存し、プロジェクトの内容そのものをブリッジにしておきます。

## 通信の形式

通信速度は115200bpsです。
ブラウザからは1行1コマンドのテキストを送り、M5Stackからは1行1JSONで返します。

| 送信するコマンド     | 動作                                                   |
| -------------------- | ------------------------------------------------------ |
| `ping`               | 生存確認（機種、チャンネル数、IMUとENV Ⅲの有無を返す） |
| `servo <ch> <deg>`   | チャンネル`ch`のサーボを`deg`度（0〜180）にする        |
| `servo 0 90 1 45`    | 複数チャンネルをまとめて指定する                       |
| `release [<ch> ...]` | サーボの出力を止めて脱力させる（省略時は全チャンネル） |
| `sensor on` / `off`  | センサー値の送信を開始または停止する                   |
| `sensor <ms>`        | センサー値の送信間隔をミリ秒で指定する（既定は100）    |
| `help`               | コマンド一覧を返す                                     |

M5Stackから届くメッセージの例です。

```json
{"type": "ready", "board": "core2", "servo": true, "channels": 2, "imu": true, "env": true}
{"type": "sensor", "time": 12345, "accel": [0.01, -0.02, 0.998], "gyro": [0.1, 0.2, 0.3], "env": {"temperature": 25.3, "humidity": 48.1}, "battery": 87, "charging": false}
{"type": "sensor", "time": 12445, "accel": null, "gyro": null, "env": null, "battery": 75, "charging": false}
{"type": "button", "name": "A"}
{"servo": {"0": 90}, "type": "ok", "command": "servo"}
{"type": "error", "command": "servo", "message": "angle out of range: 200"}
```

2行目の`sensor`は、IMUが無く、ENV Ⅲもつないでいない場合の例です。
温湿度は1秒ごとに計測し、`sensor`メッセージには最後に計測した値を載せます。

## 配線

| 機種  | ENV Ⅲ（Port A）    | サーボ チャンネル0         | サーボ チャンネル1         |
| ----- | ------------------ | -------------------------- | -------------------------- |
| Core2 | SDA: G32、SCL: G33 | Port B（底面ユニット）のG26 | Port C（底面ユニット）のG14 |
| Basic | SDA: G21、SCL: G22 | 側面のピンソケットのG26    | 側面のピンソケットのG5     |

ENV Ⅲは、Port A（赤いGroveポート）に付属のGroveケーブルで接続します。
サーボの信号線は、330Ωの抵抗を挟んでGPIOにつなぎます。
サーボモーターの電源は、M5Stackとは別の5V電源から供給し、GNDだけをM5Stackと共通にしてください。

Grove→ジャンパー変換ケーブルの線の色は、製品によって公式のピン配置と入れ替わっていることがあります。
どの線がG26か分からないときは、`servo 0 90`を送った状態でテスターを当て、約0.24V（50Hz、パルス幅1.45msの平均電圧）を示す線を探してください。
