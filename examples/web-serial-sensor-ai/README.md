# センサー値をPrompt APIで解説させる

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/web-serial-sensor-ai?file=script.js&view=preview)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in-LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/web-serial-sensor-ai)

M5Stackから受信したセンサー値を集計し、Prompt APIに装置の状態を判断させるサンプルです。
画面のボタンのほか、M5Stackの左ボタン（A）でも判断を始められます。

## 動かし方

Chrome 148以降で、このディレクトリを静的サーバーで配信して開いてください。

```bash
npm install
npm start
```

## 解説

このサンプルの背景にある仕組みは [センサー値をPrompt APIで解説させる](../../src/web-serial/sensor-ai.md) で解説しています。
