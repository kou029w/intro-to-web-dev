# Prompt API 動作確認

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-check?file=script.js&view=preview)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in-LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/prompt-api-check)

受講前に、手元のブラウザと端末でPrompt API（`LanguageModel`）を使えるかどうかを診断するページです。
次の項目を確認します。

- Chromium系ブラウザのバージョン（148以降、Chrome・Edgeなど）
- CPUのコア数、メモリ、GPU（WebGPU）の参考情報
- `LanguageModel`の有無と`LanguageModel.availability()`の結果
- モデルのダウンロードと、短いプロンプトへの応答

## 動かし方

Chrome 148以降で、このディレクトリを静的サーバーで配信して開いてください。

```bash
npm install
npm start
```

## 解説

受講環境の要件は [受講環境の事前確認](../../src/prompt-api-setup.md) にまとめています。
