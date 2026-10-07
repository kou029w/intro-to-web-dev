# WebAssemblyでAIモデルを動かす

ブラウザでAIモデルを動かす方法には、ブラウザが用意するモデルを呼び出す方法と、Webアプリがモデルを持ち込む方法があります。
[Prompt API](prompt-api.md)は、前者の「ビルトインAI」です。
ChromeではブラウザがGemini Nanoのダウンロードと更新を管理し、Webアプリは`LanguageModel`を通じて利用します。
対して、WebAssemblyとWebGPUを使う推論ライブラリでは、開発者がサードパーティのモデルを選び、ブラウザ内の計算を高速化する構成で実行します。

## Wasmとは

画像処理やAI推論には、C++などで書かれた計算処理をWebアプリでも使いたい場面があります。
そのプログラムをブラウザで動かすためのコンパイル先が、WebAssembly（Wasm）です。
CPUが実行する処理をバイナリ形式で表し、ブラウザが検証して機械語にコンパイルします。
JavaScriptは画面や入力を扱い、Wasmの関数を呼び出して計算を任せられます。
形式と実行の仕組みは[WebAssembly公式サイト](https://webassembly.org/)で説明されています。

たとえば、次のコードは2つの整数を足すWasmモジュールを読み込みます。
外部ファイルを使わずに動かすため、`.wasm`ファイルに相当するバイト列をコードに含めています。

```js runnable
const bytes = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02,
  0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x61,
  0x64, 0x64, 0x00, 0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01,
  0x6a, 0x0b,
]);
const { instance } = await WebAssembly.instantiate(bytes);
console.log(instance.exports.add(20, 22)); // 42
```

`WebAssembly.instantiate()`がモジュールを読み込み、`exports.add()`で公開された関数を呼び出しています。
実際の開発では、コンパイラーが作った`.wasm`ファイルを読み込みます。
AI推論ライブラリを使う場合、その読み込みや関数の呼び出しはライブラリが担当します。

ただし、「WasmにすればJavaScriptより必ず速くなる」という意味ではありません。
速度は計算の内容、最適化、JavaScriptとのデータの受け渡しに左右されます。
Wasmの利点は、既存の計算ライブラリと、そのライブラリが備える最適化をブラウザに持ち込めることです。

## WebGPUとの関係

AI推論では、数値を並べた配列に対する行列演算を繰り返します。
その計算をGPUに任せるためのブラウザAPIが、WebGPUです。
WasmはCPU側のプログラムを実行し、WebGPUはGPU側の計算を実行するため、両者を組み合わせて使えます。

たとえば、今回使う[WebLLM](https://webllm.mlc.ai/)は、Wasmで推論ランタイムを動かし、モデルの演算をWebGPUのシェーダーに任せます。
JavaScriptから渡した文章を処理し、GPUに計算を指示して、生成した文章をJavaScriptへ返します。
「WasmだけでGPUを使える」という意味ではなく、GPUへのアクセスにはWebGPUが必要です。
この役割分担は[WebLLMの論文](https://arxiv.org/abs/2412.15803)で説明されています。

一方、[ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)のように、WasmでCPU推論を行うライブラリもあります。
GPUを使わずに動く構成を選べますが、今回のWebLLMの例はWebGPUが必須です。
WebGPUが使えない端末では実行を止め、対応状況を表示します。

## ブラウザで使う推論ライブラリ

モデルはライブラリが対応する形式に変換して使います。
次の3つは代表的なモデルをブラウザで実行するライブラリです。（モデルそのものではありません）

- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)：Microsoftが開発し、ONNX形式のモデルをCPU（Wasm）またはGPU（WebGPUなど）で実行します。
  APIには数値配列（テンソル）を渡し、推論結果を数値配列で受け取ります。
- [LiteRT.js](https://developers.google.com/edge/litert/web)：Googleが開発し、LiteRT形式（`.tflite`）のモデルをCPU（Wasm）またはGPU（WebGPUなど）で実行します。
  APIには数値配列（テンソル）を渡し、推論結果を数値配列で受け取ります。
- [WebLLM](https://webllm.mlc.ai/)：MLC AIコミュニティが開発し、MLC形式の言語モデルをWasmのランタイムとWebGPUを組み合わせて実行します。
  APIには会話のメッセージを渡し、生成した文章を文字列で受け取ります。

ONNX Runtime WebとLiteRT.jsは用途が重なるため、使いたいモデルの形式や対応する演算を基準に選びます。
文章生成を試す場合、WebLLMなら文章とトークンの変換や生成ループをライブラリに任せ、会話用のAPIから利用できます。

## Qwen3.5-2Bで日本語を要約する

ここでは[Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)を使い、入力文を2文に要約します。
20億パラメーターのモデルで、日本語を含む多言語の文章を扱えます。
端末で動かすモデルとして、原文を与えて要約や言い換えを行う用途を試せます。
生成結果には誤りがありうるため、要約から情報が抜けていないか、原文にない内容を足していないかを照合してください。

この例では、WebLLM 0.2.85に登録された`Qwen3.5-2B-q4f32_1-MLC`を指定します。
`q4f32_1`版を選ぶことで、GPUの`shader-f16`機能を前提にしない構成にしています。
[WebLLMのモデル設定](https://github.com/mlc-ai/web-llm/blob/v0.2.85/src/config.ts)ではGPUメモリの目安は約2.6GBですが、利用できる容量や実行速度は端末によって変わります。

### サンプルを動かす

WebGPUを使えるブラウザで、次のサンプルを開いてください。
初回はライブラリとモデルを取得するため、GB単位の通信と保存領域が必要です。
2回目以降はブラウザに保存したファイルを再利用します。
推論は端末で行うため、入力文を推論サーバーに送信しません。

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/webllm-summary)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/webllm-summary)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/webllm-summary?file=script.js&view=preview)

<iframe loading="lazy" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/webllm-summary" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

### コードの要点

`CreateMLCEngine()`はモデルを読み込み、`engine.chat.completions.create()`は文章を生成します。
APIはOpenAIのChat Completions APIに似ていますが、処理はブラウザ内で完結し、APIキーは不要です。

```js
const engine = await CreateMLCEngine("Qwen3.5-2B-q4f32_1-MLC", {
  initProgressCallback: ({ text }) => (statusEl.textContent = text),
});
const stream = await engine.chat.completions.create({
  messages: [
    { role: "system", content: "入力文を日本語で2文に要約してください。…" },
    { role: "user", content: inputEl.value },
  ],
  max_tokens: 256,
  temperature: 0.2,
  extra_body: { enable_thinking: false },
  stream: true,
});
```

`max_tokens`は出力の上限です。
トークンはモデルが文章を処理する単位で、256トークンは256文字を意味しません。
`enable_thinking: false`は思考過程の生成を抑えますが、出力の先頭には空の`<think>...</think>`が付くため、表示前に取り除いています。
`stream: true`を指定すると、生成された断片を`delta.content`で順に受け取れます。
生成を途中で止めるには`engine.interruptGenerate()`を呼びます。

生成結果は`textContent`で表示しています。
モデルの出力をHTMLとして解釈すると、出力に含まれるタグが画面を書き換えるおそれがあるためです。

試した際には、次の要約が得られました。
出力は実行ごとに変わります。

```text
市立図書館は来月から平日の閉館時間を午後6時から午後8時に変更し、仕事や学校帰りの利用を支援します。
また、土日祝日の開館時間は変更せず、3か月の試行期間を通じて利用者の反応とアンケート結果に基づき継続かどうかを判断します。
```

WebGPUを使えるブラウザでも、GPUの取得、モデルのダウンロード、メモリの確保に失敗する場合があります。
エラーが出た場合は、通信とブラウザのGPU設定を確認し、GPUメモリを使うアプリを閉じてから再度実行してください。

## Prompt APIとの比較

Prompt APIは、ブラウザが管理するモデルをWebアプリから使うためのAPIです。
対して、Wasmを使う推論ライブラリは、開発者が選んだサードパーティのモデルをブラウザで実行するための部品です。
WebLLMの場合は、WasmにWebGPUを組み合わせてモデルの計算をGPUに任せます。

| 比較する項目             | Prompt API                                      | WebLLM                                                  |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------------- |
| モデルの選択             | ブラウザが提供するモデル。ChromeではGemini Nano | 開発者がQwen3.5-2Bなどを指定                            |
| 配布と更新               | ブラウザが管理                                  | Webアプリがモデルの取得先とライブラリの版を指定         |
| JavaScriptからの呼び出し | `LanguageModel.create()`と`session.prompt()`    | `CreateMLCEngine()`と`engine.chat.completions.create()` |
| 計算の実行               | ブラウザが対応する端末のCPUやGPUで実行          | WasmのランタイムとWebGPUを使用                          |
| 対応状況の確認           | `LanguageModel`の有無と`availability()`         | WebGPUの有無、GPUの取得、モデルの読み込み結果           |
| 初回の通信               | ブラウザがモデルをダウンロード                  | Webアプリがライブラリとモデルをダウンロード             |
| 推論時の入力文           | 端末で処理                                      | 端末で処理                                              |

Prompt APIを使うと、アプリ側でモデルのファイルや推論ランタイムを配布する作業を省けます。
モデルの種類や量子化を選びたい場合は、WebLLMなどでモデルを持ち込む方法を選びます。
両者の速度は、端末、モデル、入力、生成条件によって変わるため、用途に合わせて測定してください。
Prompt APIのモデル管理と要件は[Chromeの公式資料](https://developer.chrome.com/docs/ai/prompt-api)で確認できます。

## コラム：WebAssembly 3.0によるメモリ拡張と今後の動向

2025年9月17日、W3CのWebAssembly Community GroupとWorking Groupが、WebAssembly 3.0の仕様の完成を発表しました。
メモリに関する追加機能には、64ビットのアドレスを使うMemory64と、1つのモジュールで複数のメモリを扱う機能があります。
仕様の変更は[WebAssembly 3.0の公式発表](https://webassembly.org/news/2025-09-17-wasm-3.0/)で確認できます。

AI推論などでは、モデルの重みや計算途中のデータを保持するために、データの規模に応じたメモリが求められます。
Memory64は、従来4GiBまでだった1つの線形メモリのアドレス空間を広げます。
複数のメモリを扱う機能では、モデルや入出力データを用途ごとに分けて保持できます。
これらの機能によって、Wasmで扱える計算の規模や用途が広がります。

WebAssembly 3.0にはGCや例外処理の追加もあり、計算ライブラリ以外の言語処理系もブラウザに持ち込みやすくなっています。
