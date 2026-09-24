# 声でサーボモーターを動かす

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/voice-servo?file=script.js&view=preview)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in-LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/voice-servo)

Speech Recognition APIで認識した指示を、Prompt APIで関節の動作（JSON）に変換し、Web Serial APIでM5Stackに送るサンプルです。
M5Stackを接続しなくても、画面上の角度の変化で動作を確かめられます。

## 動かし方

Chrome 148以降で、このディレクトリを静的サーバーで配信して開いてください。マイクへのアクセス許可が必要です。

```bash
npm install
npm start
```

## 解説

このサンプルの背景にある仕組みは [声でサーボモーターを動かす](../../src/web-serial/voice-servo.md) で解説しています。
