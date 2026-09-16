# 画像を説明してもらう

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-image?file=script.js&view=preview)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in-LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-image)

選択した画像ファイルをPrompt API（`LanguageModel`）に渡し、内容を日本語で説明させるサンプルです。
[chrome.devのcanvas-image-prompt](https://chrome.dev/web-ai-demos/)（キャンバスに描いた絵を参照画像と見比べる作例）を、より汎用的な「画像ファイルを選んで質問する」形に単純化しています。

`content`配列に`{ type: "image", value: file }`を含めるだけで、`File`（`Blob`）をそのまま画像入力として渡せます。

## 動かし方

Chrome 148以降で、このディレクトリを静的サーバーで配信して開いてください。

```bash
npm install
npm start
```

## 解説

このサンプルの背景にある仕組みは [Prompt API入門](../../src/prompt-api.md) で解説しています。
