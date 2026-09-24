# センサー値をモニターする

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/web-serial-monitor?file=script.js&view=preview)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in-LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/web-serial-monitor)

M5Stack Core2の内蔵センサー（加速度、角速度、バッテリー）の値を、Web Serial APIで受信して表示するサンプルです。
M5Stackには [m5stack-serial-bridge](../m5stack-serial-bridge/) を書き込んでおきます。

## 動かし方

Chrome 89以降で、このディレクトリを静的サーバーで配信して開いてください。

```bash
npm install
npm start
```

## 解説

このサンプルの背景にある仕組みは [センサー値をブラウザでモニターする](../../src/web-serial/sensor-monitor.md) で解説しています。
