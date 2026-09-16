# 類義語検索

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-synonym-finder?file=script.js&view=preview)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in-LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-synonym-finder)

入力した日本語の単語の類義語を、Prompt API（`LanguageModel`）に列挙させるサンプルです。
[chrome.devのAI Synonym Finder](https://chrome.dev/web-ai-demos/)を参考にした実装で、次の2点を確認できます。

- `initialPrompts`にuser/assistantのやり取りの例を含める、いわゆる **n-shotプロンプティング**
- 共通の設定を持つ**ベースセッション**を`clone()`し、検索のたびに独立した会話として使う方法

## 動かし方

Chrome 148以降で、このディレクトリを静的サーバーで配信して開いてください。

```bash
npm install
npm start
```

## 解説

このサンプルの背景にある仕組みは [Prompt API入門](../../src/prompt-api.md) で解説しています。
