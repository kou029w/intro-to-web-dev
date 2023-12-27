# 温度センサーのデータの送信

それではRaspberry Piからスマートフォンにデータを送信してみましょう。

温度センサー SHT30 を利用して温度のデータを送信します。

## 事前準備

- Raspberry Pi
- SHT30 (温度・湿度センサ)
- 配線用のワイヤー

## 配線図

![](pizero-sht30.png)

## サンプルコード

次のようなNode.jsのコードを実行することでデータを送信します:

```js
// ここはntfy.shのURLに書き換えます
const endpoint = "https://ntfy.sh/536804b7-65aa-403f-97f6-7bd945e83491";

import { requestI2CAccess } from "node-web-i2c";
import SHT30 from "@chirimen/sht30";

const i2cAccess = await requestI2CAccess();
const port = i2cAccess.ports.get(1);
const sht30 = new SHT30(port, 0x44);
await sht30.init();

const { humidity, temperature } = await sht30.readData();
const message = `現在の温度は${temperature.toFixed(2)}度です`;

await fetch(endpoint, { method: "POST", body: message });

console.log(endpoint, message);
```

## 書式

```js
// ここはntfy.shのURLに書き換えます
const endpoint = <ntfy.shのURL>;

await fetch(endpoint, { method: "POST", body: <送信する内容> });
```

ntfy.shのURLと送信する内容の部分を書き換えて使用します。

スマートフォンに温度センサーのデータが送信されていることを確認してみましょう。

## 制約事項

**(無料枠) 1日あたりのメッセージの上限は250件です。**
10分あたり1件程度の通知を目安にしましょう。

_参考: <https://docs.ntfy.sh/publish/#limitations> より_
