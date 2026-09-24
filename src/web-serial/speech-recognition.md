# Speech Recognition APIの基礎

**Speech Recognition API**は、マイクから入力した音声を文字列に変換するAPIです。
Web Speech APIという仕様の一部で、同じ仕様には文字列を読み上げる音声合成（Speech Synthesis API）も含まれています。
このページでは、ハンズオン④で声から指示を受け取るのに必要な範囲で、音声認識の使い方を説明します。

## 対応しているブラウザ

音声認識は、Chrome、Edge、Safariで使えます。
FirefoxはFirefox 142以降に実装していますが、既定では無効になっています。

Chromeでは長らく`webkitSpeechRecognition`という接頭辞付きの名前で提供されてきました。
Chrome 139からは接頭辞のない`SpeechRecognition`でも使えます。
Safariでは現在も接頭辞付きの名前だけが使えるため、両方に対応するには次のように書きます。

```js
const SpeechRecognition =
  self.SpeechRecognition ?? self.webkitSpeechRecognition;
```

## 音声が処理される場所

Prompt APIとの大きな違いは、音声がどこで文字列に変換されるかにあります。
Chromeの音声認識は、既定ではサーバーで処理されます。
マイクの音声はGoogleのサーバーに送られ、変換された文字列がブラウザに返ってきます。
そのため、ネットワークに接続していないと動作せず、話した内容も端末の外に出ます。

Chrome 139では、端末内で音声を認識する`processLocally`が加わりました。
`processLocally`を`true`にすると、音声は端末の外に出ず、オフラインでも認識できます。
ただし、端末内での認識には、言語ごとの**言語パック**をあらかじめ端末にダウンロードしておく必要があります。

言語パックの状態は、`SpeechRecognition.available()`で確認できます。

```js runnable
const SpeechRecognition =
  self.SpeechRecognition ?? self.webkitSpeechRecognition;
const options = { langs: ["ja-JP"], processLocally: true };

console.log(await SpeechRecognition.available(options));
```

返る値の意味は、Prompt APIの`LanguageModel.availability()`とよく似ています。

| 結果             | 状態                                     |
| ---------------- | ---------------------------------------- |
| `"available"`    | 言語パックがあり、端末内で認識できる     |
| `"downloadable"` | 言語パックをダウンロードすれば認識できる |
| `"downloading"`  | 言語パックをダウンロード中               |
| `"unavailable"`  | この言語は端末内での認識に対応していない |

`"downloadable"`の場合は、`SpeechRecognition.install(options)`で言語パックをダウンロードします。
`install()`は、ダウンロードが完了すると`true`で解決するPromiseを返します。
どの言語を端末内で認識できるかはブラウザと端末によって異なり、日本語が`"unavailable"`になる環境もあります。

ハンズオン④のサンプルは、日本語の言語パックが`"available"`なら端末内で、そうでなければサーバーで認識します。
Prompt APIと組み合わせたときに、どこまでを端末内で処理しているかを意識しておいてください。

## 音声を認識する

音声認識の基本は、`SpeechRecognition`オブジェクトを作り、`start()`で聞き取りを始めて、`result`イベントで結果を受け取る流れです。

```js runnable
const SpeechRecognition =
  self.SpeechRecognition ?? self.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "ja-JP";

const transcript = await new Promise((resolve, reject) => {
  recognition.addEventListener("result", (event) => {
    resolve(event.results[0][0].transcript);
  });
  recognition.addEventListener("error", (event) => {
    reject(new Error(event.error));
  });
  recognition.addEventListener("end", () => resolve(""));
  recognition.start();
});

console.log(transcript);
```

実行ボタンを押すとマイクの使用許可を求められるので、許可してから何か話します。
話し終えて少し間を置くと、認識した文字列が表示されます。
`lang`には、認識する言語をBCP 47の言語タグ（日本語なら`"ja-JP"`）で指定します。

`start()`してから話し終えるまでの動作は、次のプロパティで変えられます。

| プロパティ       | 既定値  | `true`にしたときの動作                                   |
| ---------------- | ------- | -------------------------------------------------------- |
| `interimResults` | `false` | 話している途中の、確定していない結果も`result`で受け取る |
| `continuous`     | `false` | 話し終えても止まらず、`stop()`を呼ぶまで認識を続ける     |
| `processLocally` | `false` | 端末内で認識する                                         |

`continuous`が`false`のままなら、1回の発話を認識したところで自動的に終了し、`end`イベントが発生します。
ハンズオン④では「ボタンを押して1回話す」操作にしたいので、`continuous`は`false`のまま使います。

## 認識結果の構造

`result`イベントの`event.results`は、認識結果を入れ子にしたリストです。

```text
event.results             … 発話の区切りごとの結果のリスト
  └ event.results[i]      … 1つの区切りの結果（isFinalで確定済みかどうかがわかる）
      └ event.results[i][j] … 候補（transcriptに文字列、confidenceに信頼度）
```

1つの区切りの結果には、認識の候補が信頼度の高い順に並んでいます。
候補の数は`maxAlternatives`で指定でき、既定では1つだけです。
そのため、`event.results[0][0].transcript`が「最初の区切りの、最も確からしい文字列」になります。

`interimResults`を`true`にすると、同じ区切りの結果が、話している間に何度も更新されて届きます。
確定前の結果の`isFinal`は`false`で、区切りの認識が確定すると`isFinal`が`true`の結果が届きます。
画面に途中経過を表示し、`isFinal`が`true`になった時点で次の処理に進む、という使い分けができます。

## エラーへの対処

認識に失敗すると`error`イベントが発生し、`event.error`に原因を表す文字列が入ります。

| `event.error`              | 主な原因                                           |
| -------------------------- | -------------------------------------------------- |
| `"not-allowed"`            | マイクの使用が許可されなかった                     |
| `"no-speech"`              | 一定時間、声が検出されなかった                     |
| `"audio-capture"`          | マイクが見つからないなど、音声を取り込めなかった   |
| `"network"`                | サーバーでの認識に必要なネットワークに接続できない |
| `"language-not-supported"` | 指定した言語に対応していない                       |

`processLocally`を`true`にしたのに言語パックがない場合も、`"language-not-supported"`になります。

## サンプル

言語、途中結果の表示、連続認識、端末内での認識を切り替えて試せるサンプルです。
「端末内で処理する」にチェックを入れて開始すると、言語パックが未ダウンロードの場合はダウンロードから始まります。

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/speech-recognition-basic)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/speech-recognition-basic)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/speech-recognition-basic?file=script.js&view=preview)

<iframe loading="lazy" allow="microphone" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/speech-recognition-basic" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

## 参考

- MDN: [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)（英語）
- MDN: [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)（英語）
- [Web Speech API 仕様](https://webaudio.github.io/web-speech-api/)（英語）
- [On-device speech recognition の解説（Explainer）](https://github.com/WebAudio/web-speech-api/blob/main/explainers/on-device-speech-recognition.md)（英語）
