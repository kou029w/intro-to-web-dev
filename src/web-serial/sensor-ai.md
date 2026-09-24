# センサー値をPrompt APIで解説させる

ハンズオン①で受け取ったセンサー値を、今度はPrompt APIに渡して装置の状態を判断させます。
M5Stackのボタンを押すと、ブラウザの中の言語モデルが「揺れが続いているので固定を確認してください」のようなコメントを返す仕組みを作ります。

## サンプル

[![View on GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/kou029w/intro-to-web-dev/tree/main/examples/web-serial-sensor-ai)
[![Open in LiveCodes](https://img.shields.io/badge/Open%20in%20LiveCodes-575757)](https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/web-serial-sensor-ai)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/kou029w/intro-to-web-dev/tree/main/examples/web-serial-sensor-ai?file=script.js&view=preview)

<iframe loading="lazy" allow="serial; language-model" src="https://livecodes.io/?x=https://github.com/kou029w/intro-to-web-dev/tree/main/examples/web-serial-sensor-ai" style="width:100%; height:680px; border:0; border-radius:0.5rem;"></iframe>

## 動かしてみる

「接続」を押してM5Stackを選び、数秒待ってから「今の状態を説明する」を押します。
「モデルに渡した文」に直近約3秒間のセンサーの集計が、「モデルの判断」に正常、注意、警告のいずれかとコメントが表示されます。

続けて、M5Stackを手に持って揺らしながら、画面下の左ボタン（A）を押してみます。
ブラウザのボタンを押さなくても判断が始まり、揺れについてのコメントが返ってきます。
M5Stackを裏返して置いた場合や、USBケーブルを抜いてバッテリーだけで動かした場合も試してみましょう。

## 数値をそのまま渡さない

センサーは100ミリ秒ごとに加速度と角速度を送ってきますが、この数値の列をそのままモデルに渡しても、よい判断は得られません。
Gemini Nanoは端末上で動く小型のモデルで、「加速度の標準偏差0.04Gは揺れとして大きいのか」のような、機器ごとに異なる尺度の知識を持っていないからです。
[Prompt API入門](../prompt-api.md)で天気コードを日本語のラベルに変換したのと同じく、数値の解釈はコードで済ませてからモデルに渡します。

サンプルの`summarize()`は、直近30件のセンサー値から次の値を計算し、ラベルを付けます。

| 項目 | 計算方法                                         | ラベルの例                       |
| ---- | ------------------------------------------------ | -------------------------------- |
| 傾き | 加速度の平均から、重力の向きと画面の法線のなす角 | ほぼ水平、少し傾いている、裏返し |
| 揺れ | 加速度の大きさの標準偏差                         | 静止、小さな揺れ、大きな揺れ     |
| 回転 | 角速度の大きさの最大値                           | （数値のみ）                     |
| 落下 | 加速度の大きさが0.3Gを下回った瞬間があるか       | あり、なし                       |

その結果、モデルには次のような文が渡ります。

```text
直近2.9秒間のセンサーの集計です。
- 傾き: 3度（ほぼ水平）
- 揺れ: 標準偏差0.044G（小さな揺れ）
- 回転: 最大151度/秒
- 自由落下に近い瞬間: なし
- バッテリー: 87%（充電していない）
```

ラベルの境目（揺れなら0.02Gと0.1G）は、目安として置いた値です。
ハンズオン①のモニターで、M5Stackを置いたときと揺らしたときの値を見比べて調整してください。
取り付ける場所や用途が変われば、適切な境目も変わります。

傾きの計算は、M5Stackを画面を上にして置いたときに、加速度のz軸が約+1Gを示すことを前提にしています。
ハンズオン①のグラフで、画面を上にして置いたときにz軸が約-1Gを示していたら、`summarize()`の`mean[2]`の符号を反転させてください。

## 判断結果を構造化出力で受け取る

モデルには、コメントの文章と、正常かどうかの判定を返してもらいます。
判定は画面の色分けに使うため、`responseConstraint`のJSON Schemaで3つの値のどれかに限定します。

```js
const schema = {
  type: "object",
  properties: {
    comment: { type: "string" },
    level: { type: "string", enum: ["normal", "warning", "alert"] },
  },
  required: ["comment", "level"],
};
```

`enum`で値を列挙しておくと、モデルの出力はこの3つのどれかになります。
「注意が必要」「やや異常」のような表記の揺れを、コードの側で吸収する必要がありません。

スキーマで`comment`を`level`より先に並べているのにも、理由があります。
モデルは出力を先頭から1語ずつ生成し、JSONのプロパティはスキーマに並べた順に出力されることが多いからです。
先にコメントを書かせれば、モデルはそのコメントを踏まえて判定を選べます。
判定を先に書かせると、根拠を書く前に結論を決めることになります。

## セッションを複製して使い回す

判断のたびにシステムプロンプト付きのセッションを`LanguageModel.create()`で作り直すと、モデルがシステムプロンプトを毎回読み込み直すことになり、応答が遅くなります。
サンプルでは、システムプロンプトだけを持つ元のセッションを1つ作っておき、判断のたびに`clone()`で複製して使います。

```js
const base = await getBaseSession();
const session = await base.clone();
const result = JSON.parse(
  await session.prompt(summary, { responseConstraint: schema }),
);
session.destroy();
```

複製したセッションは、元のセッションのシステムプロンプトを引き継ぎますが、複製したあとの会話は元のセッションに残りません。
そのため、前回の判断の内容が次の判断に影響することはありません。
使い終えた複製は`destroy()`で破棄します。

## M5Stackのボタンで判断を始める

サンプルでは、ブリッジから`{"type": "button", "name": "A"}`が届いたときにも、ボタンを押したときと同じ`explain()`を呼び出しています。

```js
function handleMessage(message) {
  if (message?.type === "sensor") {
    // センサー値を記録する
  } else if (message?.type === "button" && message.name === "A") {
    explain();
  }
}
```

このページでは、データは主にM5Stackからブラウザへ流れています。
ボタンの押下もセンサー値と同じくデータとして送ることで、機器の側から処理を始められます。
現場に置いた機器のボタンで、PCの画面を見なくても判断を依頼できる、という使い方です。

ただし、モデルが未ダウンロードの状態では、M5Stackのボタンからは判断を始められません。
[Prompt API入門](../prompt-api.md)で説明したとおり、ダウンロードを伴うセッションの作成は、ブラウザ上のクリックなどのユーザー操作の延長でしか呼び出せないからです。
シリアル経由で届いたボタンの押下は、ブラウザにとってのユーザー操作に当たりません。
初回は画面の「今の状態を説明する」を押してモデルを準備してください。

## 試してみよう

- システムプロンプトの「机の上に置いた計測装置の見守り担当」を、「運搬中の荷物の見守り担当」に変えてみましょう。同じ揺れに対する判定はどう変わるでしょうか。
- 右ボタン（C）を押したときに、判断ではなく「今の状態を一言で」の説明を返すようにしてみましょう。
- 判定が`alert`になったときに、`servo`コマンドを送ってサーボモーターを動かしてみましょう（ハンズオン③のあとで）。
