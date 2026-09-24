# 音声を認識する

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/speech-recognition-basic?file=script.js&view=preview)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in-LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/speech-recognition-basic)

Speech Recognition APIで、マイクの音声を文字に変換するサンプルです。
言語、途中結果の表示、連続認識、端末内での処理（`processLocally`）を切り替えて試せます。

## 動かし方

Chrome 139以降で、このディレクトリを静的サーバーで配信して開いてください。マイクへのアクセス許可が必要です。

```bash
npm install
npm start
```

## 解説

このサンプルの背景にある仕組みは [Speech Recognition APIの基礎](../../src/web-serial/speech-recognition.md) で解説しています。
