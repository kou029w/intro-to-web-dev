# 声でサーボモーターを動かす

> **Note**\
> このページは2026年12月の研修に向けて編集中です。内容は変更されることがあります。

[テキストでサーボモーターを動かす](text-servo.md)の入力欄を声に置き換え、「もう少し右に」「正面に戻して」と話しかけるだけでサーボモーターが動く仕組みを作ります。
音声をSpeech Recognition APIで文字列にし、その文字列をテキストのときと同じ処理に渡します。

![声から、Speech Recognition APIで「もう少し右に」という文字に、Prompt APIで`add -15`に、コードで90 - 15 = 75を計算して`servo 0 75`に変換し、Web Serial APIでサーボを75度に動かす流れ](../assets/diagrams/pipeline.svg)

Prompt APIによる変換、出力の検証、指示を順番に処理する仕組みは、テキストのサンプルと同じコードです。
このページでは、そこに音声認識をつなぐ部分を扱います。

## サンプル

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/voice-servo)
[![Demo](https://img.shields.io/badge/Demo-0969da)](https://kou029w.github.io/intro-to-web-dev/examples/voice-servo/)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/voice-servo)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/voice-servo?file=script.js&view=preview)

<iframe loading="lazy" allow="serial; microphone; language-model" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/voice-servo" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

## 動かしてみる

`script.js`の先頭にある`SERVO`と、入力と出力の例は、[テキストでサーボモーターを動かす](text-servo.md#サーボモーターの設定を書き換える)で書き換えた内容に合わせます。

「話す」を押してからマイクに向かって「左を向いて」と話します。
画面に認識した文字列が表示され、話し終えると、「処理の流れ」の表に指示、モデルの出力、送信したコマンドが1行ずつ追加されます。
続けて「もう少し」「正面に戻して」と話し、テキストで指示したときと同じように角度が変わるかを確かめます。
意図どおりに動くことを確かめてから、「Core2に接続」を押してサーボモーターを動かします。

ページを開いたときの表示で、音声認識を端末内とサーバーのどちらで処理しているかを確認できます。
音声認識を利用できない環境では「話す」のボタンが表示されないため、テキストの入力欄から指示します。

## 認識結果を指示として渡す

「話す」を押すたびに、`SpeechRecognition`を1つ作って認識を始めます。

```js
talkEl.addEventListener("click", () => {
  const recognition = new SpeechRecognition();
  recognition.lang = "ja-JP";
  recognition.interimResults = true;
  recognition.processLocally = processLocally;

  recognition.addEventListener("result", (event) => {
    const result = event.results[0];
    heardEl.textContent = result[0].transcript;
    if (result.isFinal) handleInstruction(result[0].transcript);
  });
  // （エラーと終了の処理は略）

  recognition.start();
  getBaseSession().catch(() => {});
});
```

`interimResults`を`true`にしているので、話している途中の文字列も`result`で届きます。
途中の文字列は画面に表示するだけにし、`isFinal`が`true`になった確定済みの文字列だけを`handleInstruction()`に渡します。
途中の文字列を渡すと、「もう少し右に」の「もう少し」の時点でモデルが動き始めてしまうからです。

`handleInstruction()`は、テキストの入力欄の送信で呼んでいる関数と同じものです。
声の指示も文字の指示も同じ待ち行列に入るので、2つを混ぜて続けて送っても、届いた順に1つずつ処理されます。

`start()`の直後に`getBaseSession()`を呼んでいるのは、話しているあいだにモデルの準備を進めておくためです。
システムプロンプトと例を読み込ませたセッションの作成には時間がかかることがあり、認識が確定してから作り始めると、そのぶん動き出しが遅れます。

## 思いどおりに動かないときの見分け方

声で指示したときに意図と違う動きをした場合、原因は2か所に分かれます。
音声認識が言葉を聞き違えたのか、正しく聞き取れた指示をモデルが誤って変換したのかです。

「処理の流れ」の表の「指示」の列には、認識した文字列がそのまま入ります。
この列が話した言葉と違っていれば、聞き取りの問題です。
はっきり話し直すか、マイクの位置を変えて試します。
この列が正しいのに「モデルの出力」が意図と違っていれば、変換の問題なので、同じ文字列をテキストで送って再現するかを確かめます。
テキストでも再現するなら、[入力と出力の例](text-servo.md#入力と出力の例を示す)やシステムプロンプトを見直します。

## どこで処理しているか

このサンプルでは、指示を受け取ってからサーボモーターが動くまで、ほとんどの処理がブラウザの中で完結しています。

| 処理          | 場所                                               |
| ------------- | -------------------------------------------------- |
| 音声の認識    | 日本語の言語パックがあれば端末内、なければサーバー |
| 指示の解釈    | 端末内（Gemini Nano）                              |
| 検証と換算    | 端末内（JavaScript）                               |
| Core2との通信 | 端末内（USBシリアル）                              |

ページとモデルを読み込んだあとなら、テキスト入力欄から指示する場合と、日本語の言語パックで音声を端末内で認識できる場合は、ネットワークを切断してもサーボモーターを操作できます。

## グループワーク

グループで1つの課題を選び、サンプルを改造してみましょう。

- **首を振る**：「首を振って」と話しかけると、右を向く、左を向く、正面に戻る、の3つの動作を順に行うようにします。例を追加すると、モデルが意図どおりの動作列を返しやすくなります。
- **緊急停止**：「止まって」「ストップ」と言ったら、モデルを通さずにすぐ`release`を送るようにします。確実に動いてほしい指示を、モデルの解釈に任せるべきかどうかを考えてみましょう。
- **返事を声で返す**：`reply`の文章を、Speech Synthesis API（`speechSynthesis.speak()`）で読み上げます。
- **ゆっくり動かす**：「ゆっくり」と指示されたら、1度ずつ時間をかけて目標の角度に近づけます。速さを表す項目をスキーマに加えるところから考えます。
- **センサーと組み合わせる**：Core2を傾けた向きにサーボホーンを向け、「そのまま」と言うまで追いかけ続けるようにします。
- **判定に応じて警告を変える**：[センサーと音声をPrompt APIでつなぐ](sensor-assistant.md)のサンプルは、モデルが`alert`を返したときだけ警告します。`warning`のときも、`alert`より小さな角度で警告するようにします。

## まとめ

- Speech Recognition APIで音声を文字列に、Prompt APIで文字列をJSONに、Web Serial APIでJSONから作ったコマンドを機器に送る
- 確定した認識結果だけをモデルに渡し、途中の文字列は画面に表示するだけにする
- 声と文字の入り口を1つの関数にまとめ、同じ待ち行列で順番に処理する
- 意図と違う動きをしたら、認識した文字列とモデルの出力を見比べて、聞き取りと変換のどちらの問題かを切り分ける

## センサーとの連携

続いて[センサーと音声をPrompt APIでつなぐ](sensor-assistant.md)で、揺れへの警告、音声による計測間隔の変更、状態への質問を試します。
