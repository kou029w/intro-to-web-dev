# WebLLMで日本語を要約する

[![Demo](https://img.shields.io/badge/Demo-0969da)](https://kou029w.github.io/intro-to-web-dev/examples/webllm-summary/)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/webllm-summary)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/webllm-summary?file=script.js&view=preview)

[WebLLM](https://webllm.mlc.ai/)でQwen2.5-0.5Bをブラウザ内で動かし、入力した文章を2文に要約するサンプルです。

## 動かし方

WebGPUを使えるブラウザで、このディレクトリを静的サーバーで配信して開いてください。

```bash
npm install
npm start
```

初回はモデル（約0.3GB）のダウンロードで通信が発生します。

## 解説

このサンプルの背景にある仕組みは [WebAssemblyでAIモデルを動かす](https://kou029w.github.io/intro-to-web-dev/web-ai/webassembly.html) で解説しています。
