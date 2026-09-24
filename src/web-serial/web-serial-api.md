# Web Serial APIの基礎

**Web Serial API**は、USBなどでPCにつないだシリアル機器と、Webページが直接データをやり取りするためのAPIです。
マイコンボード、計測器、3Dプリンターなど、シリアル通信で操作する機器の多くを、専用のアプリなしでブラウザから扱えます。
このページでは、ハンズオンのサンプルを読むのに必要な範囲で、シリアル通信とWeb Serial APIの仕組みを説明します。

## シリアル通信の仕組み

**シリアル通信**は、1本の信号線でデータを1ビットずつ順番に送る通信方式です。
送る側と受け取る側は、1秒あたりに送るビット数（**ボーレート**）をあらかじめ揃えておきます。
揃っていないと、受け取る側はビットの区切りを読み違え、意味のないバイト列を受け取ることになります。
ハンズオンのブリッジは115200bpsで通信するため、ブラウザ側も115200bpsで接続します。

M5Stack Core2のように、USBケーブルでつなぐ機器の多くは、基板上のUSBシリアル変換チップでUSBとシリアル通信を相互に変換しています。
PCからはこの変換チップが**シリアルポート**に見え、WindowsならCOM3、Linuxなら`/dev/ttyUSB0`のような名前が付きます。

シリアル通信が運ぶのはバイト列だけです。
どこで1つのメッセージが終わるのか、バイト列をどう解釈するのかは、通信する両者の取り決めに任されています。
ハンズオンのブリッジでは「1行に1メッセージ、改行で区切る」「ブラウザからはテキストのコマンド、ブリッジからはJSON」と決めています（[ブリッジとの通信の取り決め](m5stack-setup.md#ブリッジとの通信の取り決め)）。

## 対応しているブラウザ

Web Serial APIは、Chrome 89以降とEdge 89以降のデスクトップ版で使えます。
Firefoxは2026年5月のFirefox 151でデスクトップ版に実装しました。
Firefoxでは、Web Serial APIを使うサイトごとに、ブラウザが自動生成するサイト権限アドオンをインストールする必要があります[^firefox]。
Safariは対応していません。

このハンズオンではPrompt APIも使うため、受講環境はChrome 148以降に揃えています。

[^firefox]: WebMIDIと同じ仕組みで、アドオンのインストールが利用者の明示的な許可の役割を果たします。詳しくは [Firefox 151 for developers](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/151) を参照してください。

## ポートを選んでもらう

Webページがシリアル機器を勝手に操作できると、利用者の知らないうちに機器の設定を書き換えることもできてしまいます。
そのためWeb Serial APIでは、どのポートにアクセスさせるかを、利用者がブラウザの選択画面で決めます。

```js
connectButton.addEventListener("click", async () => {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 115200 });
});
```

`navigator.serial.requestPort()`を呼ぶと、ブラウザが接続中のシリアルポートの一覧を表示します。
利用者がポートを選ぶと、そのポートを表す`SerialPort`オブジェクトが返ります。
選択画面を閉じた場合は`NotFoundError`で失敗します。

`requestPort()`は、クリックなどのユーザー操作の延長でしか呼び出せません。
ページを開いただけで選択画面が出ることはなく、利用者がボタンを押したときにだけ許可を求められます。
いったん許可したポートは、次回以降`navigator.serial.getPorts()`で選択画面なしに取得できます。

選んだポートは、`port.open()`で開いてから使います。
`baudRate`は必須で、機器側と同じ値を指定します。

## バイト列を受け取る

開いたポートの`port.readable`は、受信したデータを`Uint8Array`の断片として順に流す**ReadableStream**です。
`getReader()`で読み取り用のオブジェクトを取り出し、`read()`を繰り返し呼び出して断片を受け取ります。

```js
const reader = port.readable.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop();
  for (const line of lines) {
    console.log(line);
  }
}
reader.releaseLock();
```

`read()`が返す断片は、ブリッジが送った1行とは対応していません。
シリアル通信には行という単位がなく、ブラウザは届いた分のバイト列をその時点でまとめて渡すからです。
1行のJSONが2つの断片に分かれて届くことも、2行分が1つの断片にまとめて届くこともあります。

```text
1回目の断片: {"type":"sensor","time":1234,"acc
2回目の断片: el":[0.01,-0.02,0.998],...}\n{"type":"but
3回目の断片: ton","name":"A"}\n
```

そこで、受け取った文字列をいったん`buffer`に溜め、改行で分割します。
`split("\n")`で得た配列の最後の要素は、まだ改行が届いていない途中の行なので、`pop()`で取り出して`buffer`に戻します。
それより前の要素だけが、完全な1行として扱えます。

バイト列から文字列への変換にも、同じ注意が要ります。
UTF-8では日本語の1文字が3バイトで表されるため、1文字の途中で断片が切れることがあります。
`TextDecoder`の`decode()`に`{ stream: true }`を指定すると、途中で切れたバイトを次の呼び出しまで持ち越し、文字化けを防げます。

## 文字列を送る

送信には`port.writable`を使います。
こちらは書き込み用の**WritableStream**で、`getWriter()`で取り出したオブジェクトの`write()`にバイト列を渡します。

```js
const writer = port.writable.getWriter();
const encoder = new TextEncoder();

await writer.write(encoder.encode("servo 0 90\n"));
```

`TextEncoder`で文字列をUTF-8のバイト列に変換してから渡します。
行の終わりを示す改行を付け忘れると、ブリッジはコマンドの続きを待ち続け、何も実行しません。

## ポートを閉じる

`getReader()`や`getWriter()`でオブジェクトを取り出している間、ストリームは**ロック**された状態になります。
ロックされたストリームを持つポートは`close()`で閉じられないため、閉じる前に読み書きのオブジェクトを手放します。

```js
await reader.cancel(); // 待機中のread()がdone: trueで終わる
reader.releaseLock();
writer.releaseLock();
await port.close();
```

読み取りのループが別の場所で動いている場合は、`reader.cancel()`だけを呼び、ループを抜けた先で`releaseLock()`と`close()`を行います。
ハンズオンのサンプルは、この形で書いています。

USBケーブルが抜かれた場合は、待機中の`read()`が例外で失敗します。
ループを`try...catch`で囲んでおくと、ケーブルが抜けたときに画面の表示を「未接続」に戻し、再接続を促せます。

## 参考

- MDN: [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)（英語）
- Chrome for Developers: [Read from and write to a serial port](https://developer.chrome.com/docs/capabilities/serial)（英語）
- [Web Serial API 仕様（WICG）](https://wicg.github.io/serial/)（英語）
