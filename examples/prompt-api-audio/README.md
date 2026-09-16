# 音声を文字起こしする

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-audio?file=script.js&view=preview)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in-LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-audio)

マイクから5秒間録音した音声を、Prompt API（`LanguageModel`）にそのまま渡して文字起こしするサンプルです。
[chrome.devのmediarecorder-audio-prompt](https://chrome.dev/web-ai-demos/)を参考にした実装です。

`MediaRecorder`で録音した`Blob`を`arrayBuffer()`で変換し、`content`配列に`{ type: "audio", value: arrayBuffer }`として渡します。

## 動かし方

Chrome 148以降で、このディレクトリを静的サーバーで配信して開いてください。マイクへのアクセス許可が必要です。

```bash
npm install
npm start
```

`file://`から直接開くと、`getUserMedia()`がセキュアコンテキストとして扱われず失敗します。

## 解説

このサンプルの背景にある仕組みは [Prompt API入門](../../src/prompt-api.md) で解説しています。
