# コンテキスト使用量の管理

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-context-window?file=script.js&view=preview)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in-LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-context-window)

チャットを続けるうちに`session.contextUsage`と`session.contextWindow`がどう増えていくかを確認できるサンプルです。
[chrome.devのprompt-api-session-compacting](https://chrome.dev/web-ai-demos/)を参考にしていますが、元のデモがSummarizer APIとLanguageDetector APIを組み合わせているのに対して、このサンプルはPrompt API単体で完結するように単純化しています。

「会話を要約して圧縮する」ボタンを押すと、モデル自身にこれまでの会話を要約させ、その要約だけを`initialPrompts`に持たせた新しいセッションに作り直します。
古いセッションを`destroy()`してから作り直すことで、コンテキスト使用量をリセットしつつ、会話の要点だけを引き継げます。

## 動かし方

Chrome 148以降で、このディレクトリを静的サーバーで配信して開いてください。

```bash
npm install
npm start
```

## 解説

このサンプルの背景にある仕組みは [Prompt API入門](../../src/prompt-api.md) で解説しています。
