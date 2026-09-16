# Prompt API プレイグラウンド

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-playground?file=script.js&view=preview)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in-LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-playground)

システムプロンプト・ユーザープロンプト・JSON Schemaを自由に入力して、Prompt API（`LanguageModel`）の応答をストリーミングで確認できるサンプルです。
[Microsoft EdgeのPrompt APIプレイグラウンド](https://microsoftedge.github.io/Demos/built-in-ai/playgrounds/prompt-api/)を参考にした、最小構成の実装です。

## 動かし方

Chrome 148以降で、このディレクトリを静的サーバーで配信して開いてください。

```bash
npm install
npm start
```

`file://`から直接開くと、`<script type="module">`がCORSでブロックされるため動作しません。

## 解説

このサンプルの背景にある仕組みは [Prompt API入門](../../src/prompt-api.md) で解説しています。
