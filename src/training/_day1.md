---
marp: true
theme: training
lang: ja
size: 16:9
paginate: true
transition: fade 0.3s
title: Day 1 PC だけで動かす
---

<!-- _class: cover seq -->
<!-- _paginate: false -->
<!-- _backgroundImage: url('assets/avatar-wave.jxl') -->
<!-- _backgroundSize: 210px -->
<!-- _backgroundPosition: right 70px bottom 30px -->
<!-- _backgroundRepeat: no-repeat -->

![WebDINO Japan](assets/webdino-logo-horizontal.svg)

## Day 1

# PC だけで、AI を動かして<br>記録を残す

Prompt API、WebAssembly、ファイルへの保存

> 2026年12月1日　10:00〜17:00

---

<!-- _class: day late-note -->

# 今日の時間割

| 時刻 | 内容 | 確かめること |
| --- | --- | --- |
| 10:00 | Web プラットフォームの今 | 2日間で使う API の全体像 |
| 10:30 | Prompt API 入門 | セッション、ストリーミング、構造化出力 |
| 11:25 | Prompt API サンプル集 | 入力、プロンプト、出力の対応 |
| 13:10 | WebAssembly で AI モデルを動かす | Wasm と WebGPU の役割 |
| 13:55 | File System Access API と OPFS | 保存先の違い |
| 14:40 | ミニチャレンジ | 業務の文章で小さなアプリを作る |
| 16:00 | 成果の共有 | 出力の確かめ方 |
| 16:40 | 振り返りと質疑 | Day 2 への準備 |

> 休憩 11:15、14:30、15:50（各10分）　昼休み 12:10〜13:10

---

<!-- _class: part -->
<!-- _backgroundImage: url('assets/avatar-point-left.jxl') -->
<!-- _backgroundSize: 260px -->
<!-- _backgroundPosition: right 90px center -->
<!-- _backgroundRepeat: no-repeat -->

PART 1

# Web プラットフォームの今

## ブラウザーという実行環境

---

<!-- _class: seq late-note -->

# 書くのは HTML と JavaScript だけ

- AI モデル、USB 機器、ファイル、Wasm の計算を、同じ JavaScript から呼ぶ
- API はどれもブラウザーに最初から入っている
- API のために OS に入れるのは、Core2 の USB シリアル変換チップ用のドライバーだけ

> Node.js と `npm install` は、サンプルを `http://localhost` で配信するためのもの

---

<!-- _class: cols seq punch -->

# 開いただけのサイトに、機器を触らせない

### **ユーザー操作の延長**で呼ぶ

- `requestPort()`
- `showSaveFilePicker()`
- 未取得時の `LanguageModel.create()`

### **安全なコンテキスト**で開く

- `https://` か `http://localhost`
- `file://` では、どのサンプルも動かない

ポートやファイルを選ぶのは利用者。ページの読み込み時に呼ぶと失敗する

動かないときに、最初に疑う2か所

---

<!-- _class: split -->

# 応答も受信も、同じストリーム

```js
// Prompt API
const stream =
  session.promptStreaming(text);
for await (const chunk of stream) {
  output.textContent += chunk;
}

// Web Serial API
const reader =
  port.readable.getReader();
const { value, done } =
  await reader.read();
```

**`promptStreaming()` の戻り値**
`ReadableStream`

**`port.readable`**
これも `ReadableStream`

**共通点**
届いた分から順に処理する

---

<!-- _class: part -->

PART 2

# Prompt API サンプル集

## ブラウザーで試す

---

<!-- _class: demos late-note -->

# 動かすサンプルと、確かめること

| サンプル | 確かめること |
| --- | --- |
| プレイグラウンド | システムプロンプトを変えると、応答がどう変わるか |
| 類義語検索 | 並べた例の形と、応答の形が一致するか |
| 画像を説明してもらう | 写っているものと、説明の対応 |
| 音声を文字起こしする | 話した内容と、文字起こしの対応 |
| 書き起こしのフィラー除去 | 1段目の文字起こしと、2段目の文の対応 |

> どのサンプルでも、入力、プロンプト、出力の3つを並べて見る

---

<!-- _class: split -->

# 画像も音声も、そのまま渡す

```js
const session = await LanguageModel.create({
  expectedInputs: [
    { type: "text" }, { type: "image" },
  ],
});
session.promptStreaming([{
  role: "user",
  content: [
    { type: "text", value: promptEl.value },
    { type: "image", value: file },
  ],
}]);
```

**画像**
ファイル選択で得た `File`

**音声**
`type: "audio"` に、録音した `Blob` の `arrayBuffer()`

**先に宣言する**
使う入力の種類を `expectedInputs` に書く

---

<!-- _class: split -->

# 例を並べて、答えの形を示す

```js
LanguageModel.create({ initialPrompts: [
  { role: "system",
    content: "あなたは日本語の類語辞典です…" },
  { role: "user",
    content: "「面白い」の類義語を挙げて…" },
  { role: "assistant",
    content: "- 愉快\n- 楽しい\n- 興味深い…" },
]});
```

**n-shot プロンプティング**
入力と出力の例を先に見せる

**`clone()`**
例を読ませたセッションを複製して、検索のたびに使う

---

<!-- _class: swap late-note -->

# 要約も翻訳も、プレイグラウンドで

| システムプロンプト | 試せること |
| --- | --- |
| 入力文を3行に要約してください。 | 要約 |
| 入力文を英語に翻訳してください。 | 翻訳 |

> JSON Schema の欄に書くと、同じ画面で構造化出力も試せる

---

<!-- _class: part -->
<!-- _backgroundImage: url('assets/avatar-think.jxl') -->
<!-- _backgroundSize: 250px -->
<!-- _backgroundPosition: right 90px center -->
<!-- _backgroundRepeat: no-repeat -->

PART 3

# WebAssembly

## AI モデルを持ち込む

---

<!-- _class: flow seq -->

# Wasm は CPU 側、WebGPU は GPU 側

1. JavaScript
   - 画面と入力
1. **Wasm**
   - 推論ランタイム
1. WebGPU
   - モデルの演算

WebLLM はこの3つを組み合わせる。GPU には WebGPU を通して届く

> 「Wasm にすれば JavaScript より必ず速い」わけではない。利点は、既存の計算ライブラリと最適化を持ち込めること

---

<!-- _class: compare libs -->

# ブラウザーで使う推論ライブラリ

| ライブラリ | モデルの形式 | 渡すもの、受け取るもの |
| --- | --- | --- |
| ONNX Runtime Web | ONNX | 数値配列（テンソル） |
| LiteRT.js | LiteRT（`.tflite`） | 数値配列（テンソル） |
| WebLLM | MLC | 会話のメッセージと、生成した文章 |

ONNX Runtime Web と LiteRT.js は、どちらも CPU（Wasm）か GPU（WebGPU など）で動く。モデルの形式と対応する演算で選ぶ

演習では WebLLM で Qwen2.5-0.5B に要約させる

---

<!-- _class: cols seq -->

# Wasm の新しい機能

### **WebAssembly 3.0**

- Memory64：4GiB までだった線形メモリのアドレス空間を広げる
- 1つのモジュールで複数のメモリを扱える
- 2025年9月に仕様の完成を発表

### **JSPI**

- Promise を返す JavaScript の関数を、Wasm から同期的に呼ぶ
- 解決するまで Wasm の実行を止めて待つ
- 標準化済み。Chrome 137 以降

---

<!-- _class: part -->

PART 4

# 記録を保存する

## File System Access API と OPFS

---

<!-- _class: compare punch -->

# 保存先は、利用者が選ぶか、アプリが持つか

|  | File System Access API | OPFS |
| --- | --- | --- |
| 保存先 | 利用者が選んだ PC 上のファイル | オリジンごとの領域 |
| 選択画面 | 必要 | 不要 |
| 開く方法 | PC のアプリからも開ける | Web アプリが読み込む |
| 入口 | `showSaveFilePicker()` | `navigator.storage.getDirectory()` |

`localhost:3000` と `localhost:3001` は別のオリジン。同じ URL で開き直す

持ち帰る記録は、選んだファイルにも保存する

---

<!-- _class: part -->
<!-- _backgroundImage: url('assets/avatar-laptop.jxl') -->
<!-- _backgroundSize: 260px -->
<!-- _backgroundPosition: right 90px center -->
<!-- _backgroundRepeat: no-repeat -->

PART 5

# ミニチャレンジ

## 業務の文章を処理する小さなアプリ

---

<!-- _class: tasks -->

# お題の例

| お題 | 出発点 | 返させる形 |
| --- | --- | --- |
| 試験記録の所見を1文に要約 | プレイグラウンド | `summary` |
| 不具合報告を重大度で分類 | プレイグラウンド | `severity`、`reason` |
| 問い合わせを担当部署に振り分け | 類義語検索 | `department` |
| 記録から日付と数値を抜き出す | プレイグラウンド | `items` |
| 口頭の報告を書き言葉に言い換え | フィラー除去 | `replaced` |

手が止まったら、毎週のように繰り返している作業を思い出す

---

<!-- _class: flow steps seq -->

# 70分の進め方

1. 題材を選び<br>手作業の結果を3件
   - 10分
1. サンプルを開き<br>そのまま動かす
   - 10分
1. **プロンプトと<br>スキーマを変える**
   - 30分
1. 3件と比べ<br>コードで確かめる
   - 20分

読みやすい要約にも、元の文章にない数値が混ざることがある

> LiveCodes や StackBlitz ではファイル選択画面を開けないので、記録は OPFS に保存する

---

<!-- _class: share seq -->
<!-- _backgroundImage: url('assets/avatar-idea.jxl') -->
<!-- _backgroundSize: 220px -->
<!-- _backgroundPosition: right 80px top 150px -->
<!-- _backgroundRepeat: no-repeat -->

# 成果の共有で話すこと

1人2分程度

1. 何を入力し、モデルに何を返させたか
1. モデルの出力が正しいかを、*どう確かめたか*

> 業務の文章を使うときは、社内規程に従う。外部の API を呼ぶサンプルでは、渡した値が通信先に送られる

---

<!-- _class: cover end seq -->
<!-- _paginate: false -->
<!-- _backgroundImage: url('assets/avatar-wave.jxl') -->
<!-- _backgroundSize: 210px -->
<!-- _backgroundPosition: right 70px bottom 30px -->
<!-- _backgroundRepeat: no-repeat -->

![WebDINO Japan](assets/webdino-logo-stacked.svg)

今日はモデルの出力を、コードで確かめた

# 明日は、その出力で<br>機器を動かします

> Day 2 は M5Stack Core2 を USB でつなぐ
> Node.js、ドライバー、教材リポジトリを用意しておく
