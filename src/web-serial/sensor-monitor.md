# センサー値をブラウザでモニターする

最初のハンズオンでは、M5Stack Core2の内蔵センサーの値をブラウザで受け取り、グラフに描きます。
データはM5Stackからブラウザへの一方向に流れるだけなので、Web Serial APIの受信の流れを確かめるのに向いています。

## サンプル

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/web-serial-monitor)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/web-serial-monitor)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/web-serial-monitor?file=script.js&view=preview)

<iframe loading="lazy" allow="serial" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/web-serial-monitor" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

## 動かしてみる

M5StackをUSBケーブルでPCにつなぎ、「接続」を押します。
ポートの選択画面には、USBシリアル変換チップの名前（「CP2104」「USB Serial」など）が付いたポートが表示されるので、それを選びます。
候補が複数あって分からないときは、M5Stackのケーブルを抜き差しして、消えたり現れたりするものを選びます。

接続すると、加速度のグラフが右へ伸びていきます。
M5Stackを机に置いたまま動かさなければ、3本の線のうち1本だけが約1G（置く向きによっては約-1G）を示し、残りの2本は0G付近にとどまります。
静止していても、重力の分の加速度をセンサーが計測しているからです。
M5Stackを傾けると、この約1Gがほかの軸にも分かれて現れ、傾けた向きに応じて3本の線の高さが入れ替わります。

画面下のボタン（A、B、C）を押すと、「最後に押されたボタン」の表示とログが更新されます。
「コマンドを送る」の欄から`sensor 500`を送ると、センサー値の送信間隔が0.5秒に変わり、グラフの伸びが遅くなります。
`sensor off`で送信を止め、`sensor on`で再開できます。

## コードを読む

サンプルの`script.js`は、[Web Serial APIの基礎](web-serial-api.md)で説明した「ポートを選ぶ」「行ごとに受け取る」「送る」「閉じる」をそのまま組み合わせています。
ここでは、ハンズオンのサンプルに共通する書き方を3つ取り上げます。

### 接続から切断までを1つの関数にまとめる

「接続」ボタンの処理は、接続してから切断されるまでを1つの関数で書いています。

```js
connectEl.addEventListener("click", async () => {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
  } catch (error) {
    statusEl.textContent = `接続できませんでした: ${error.message}`;
    return;
  }

  writer = port.writable.getWriter();
  setConnected(true);
  statusEl.textContent = "接続しました。";
  sendLine("sensor on");

  // 切断されるまで、ここで受信を続ける
  await readLines(handleLine);

  writer.releaseLock();
  await port.close().catch(() => {});
  setConnected(false);
  statusEl.textContent = "切断しました。";
});
```

`readLines()`は、受信のループが終わるまで完了しないPromiseを返します。
ループが終わるのは、「切断」ボタンで`reader.cancel()`が呼ばれたときと、USBケーブルが抜けて`read()`が失敗したときです。
どちらの場合も`await readLines()`の次の行に進むため、ポートを閉じて画面を未接続の状態に戻す処理を1か所に書くだけで済みます。

接続した直後に`sensor on`を送っているのは、ほかのサンプルで`sensor off`を送ったままになっている場合に備えるためです。
ブリッジは再起動するまで最後に受け取った設定を覚えているので、ページを開き直しても送信は止まったままになります。

### JSONでない行を読み飛ばす

ブリッジから届く行は、すべてJSONだとは限りません。
接続した瞬間にM5Stackが再起動し、ESP32（Core2のマイコン）の起動時のメッセージが流れてくることがあるからです。

```js
function handleLine(line) {
  if (!line) return;
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    // 起動時のログなど、JSONでない行はそのまま表示する
    log(line);
    return;
  }
  handleMessage(message);
}
```

`JSON.parse()`が失敗した行は、ログに表示するだけにして処理を続けます。
例外を捕まえずにおくと、1行の解析の失敗で受信のループ全体が止まってしまいます。

### メッセージの種類で処理を分ける

JSONに変換したメッセージは、`type`の値で処理を分けます。

```js
function handleMessage(message) {
  switch (message?.type) {
    case "sensor": {
      const [ax, ay, az] = message.accel;
      // 数値の表示とグラフの更新
      break;
    }
    case "button":
      // 押されたボタンの表示
      break;
    default:
      log(JSON.stringify(message));
  }
}
```

ブリッジは、センサー値、ボタン、コマンドの実行結果という種類の違うメッセージを、1本のシリアル通信に混ぜて送ってきます。
すべてのメッセージに`type`を持たせておくと、受け取る側は1つの`switch`文で振り分けられます。

## 試してみよう

- 角速度（`gyro`）もグラフに描いてみましょう。M5Stackを机の上で回すと、どの軸の値が変わるでしょうか。
- 加速度の大きさ（`Math.hypot(ax, ay, az)`）が0.3Gを下回ったら、画面の色を変えてみましょう。M5Stackが自由落下に近い状態になると、加速度の大きさが0Gに近づきます。落とすときは、クッションの上など壊れない場所で試してください。
- `sensor 20`を送って送信間隔を短くすると、グラフの動きはどう変わるでしょうか。
