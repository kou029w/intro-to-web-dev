# ツール呼び出し（天気ツール）

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-tool-use?file=script.js&view=preview)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in-LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-tool-use)

Prompt APIに`tools`を渡し、モデルが必要に応じて`get_weather`関数を自分で呼び出す様子を確認できるサンプルです。
[chrome.devのprompt-api-tool-use](https://chrome.dev/web-ai-demos/)を参考にした実装で、npm/GitHub検索という元のツール群を、これまでのサンプルと同じOpen-Meteoの天気取得ツール1つに置き換えています。

> **Note**\
> ツール呼び出しは、このリポジトリのほかのPrompt APIサンプルよりも実験的な機能です。
> `LanguageModelToolCall`などのグローバルが存在しない場合、Chromeのフラグを有効にしないと動作しないことがあります。

## 仕組み

1. `LanguageModel.create({ tools })`でツールの名前・説明・入力スキーマだけをモデルに伝えます。実際に関数を実行するのはページ側の役割です。
2. `promptStreaming()`が返すストリームには、テキストの断片と`{ type: "tool-call", value }`が混在して流れてきます。
3. ツール呼び出しを受け取ったら、対応する関数をページ側で実行し、結果を`LanguageModelToolSuccess`（または失敗時は`LanguageModelToolError`）として`role: "user"`のメッセージで送り返します。
4. モデルがそれ以上ツールを必要としなくなるまで、2〜3を繰り返します。

## 動かし方

Chrome 148以降で、このディレクトリを静的サーバーで配信して開いてください。

```bash
npm install
npm start
```

## 解説

このサンプルの背景にある仕組みは [Prompt API入門](../../src/prompt-api.md) で解説しています。
