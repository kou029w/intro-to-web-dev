# M5Stack USBシリアル ブリッジ

M5Stack Core2（UIFlow2）で動かすMicroPythonプログラムです。
USBシリアルを通じて、ブラウザとM5Stackのあいだで次の2つをやり取りします。

- M5Stackからブラウザへ：内蔵センサー（加速度、角速度、バッテリー）の値と、画面下のボタンの押下
- ブラウザからM5Stackへ：PCA9685に接続したサーボモーター（最大16チャンネル）の角度

## 書き込み方

1. M5BurnerでCore2にUIFlow2ファームウェアを書き込みます
2. [UIFlow2](https://uiflow2.m5stack.com/)を開き、デバイスにCore2を選んでUSB（WebTerminal）で接続します
3. Pythonのタブに`main.py`の内容を貼り付け、「Run Always」を押してデバイスに保存します

詳しい手順は [M5Stackの準備](../../src/web-serial/m5stack-setup.md) を参照してください。

## 通信の形式

通信速度は115200bpsです。
ブラウザからは1行1コマンドのテキストを送り、M5Stackからは1行1JSONで返します。

| 送信するコマンド     | 動作                                                   |
| -------------------- | ------------------------------------------------------ |
| `ping`               | 生存確認（PCA9685が見つかったかどうかも返す）          |
| `servo <ch> <deg>`   | チャンネル`ch`のサーボを`deg`度（0〜180）にする        |
| `servo 0 90 1 45`    | 複数チャンネルをまとめて指定する                       |
| `release [<ch> ...]` | サーボの出力を止めて脱力させる（省略時は全チャンネル） |
| `sensor on` / `off`  | センサー値の送信を開始または停止する                   |
| `sensor <ms>`        | センサー値の送信間隔をミリ秒で指定する（既定は100）    |
| `help`               | コマンド一覧を返す                                     |

M5Stackから届くメッセージの例です。

```json
{"type": "ready", "servo": true, "channels": 16}
{"type": "sensor", "time": 12345, "accel": [0.01, -0.02, 0.998], "gyro": [0.1, 0.2, 0.3], "battery": 87, "charging": false}
{"type": "button", "name": "A"}
{"servo": {"0": 90}, "type": "ok", "command": "servo"}
{"type": "error", "command": "servo", "message": "angle out of range: 200"}
```

## 配線

PCA9685のボードは、Core2のPort A（赤いGroveポート、SDA: G32、SCL: G33）に接続します。
I2Cアドレスは既定の`0x40`を想定しています。
サーボモーターの電源（V+）は、M5Stackとは別の5V電源から供給してください。
