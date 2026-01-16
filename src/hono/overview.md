# Honoとエッジランタイム

Web開発のフレームワークの世界で、最近注目を集めているHono（炎）について学んでいきましょう。
Honoにはエッジランタイムにぴったりな特徴があります。

## この記事で学べること

- なぜユーザーに近い場所 (エッジ) でコードを動かすことが重要なのか理解する
- Honoがどのようにその課題を解決するのか理解する

## 通信の物理的限界: 光の速さでも遅い？

あなたが東京にいて、アメリカ・オレゴン州にあるサーバーにアクセスするとします。

直線距離は約8,000km。光の速度は約300,000km/sなので、単純計算で片道約26.7ミリ秒、往復で約 [53.4ミリ秒](https://www.wolframalpha.com/input?i=2*%288000km%2F%E5%85%89%E3%81%AE%E9%80%9F%E5%BA%A6%29) かかります。

「たった53.4ミリ秒？」と思うかもしれませんが、これは**理論上の限界値**です。実際には、ケーブルが直線ではなかったり、サーバーでの処理時間があったり、ルーターを経由したりするので、100〜200ミリ秒以上かかることは珍しくありません。

### なぜこれが問題なのか

Webアプリケーションでは、1回のページ表示で何十回もサーバーとの通信が発生します。

- HTMLの取得
- CSSの取得
- JavaScriptの取得
- APIからデータの取得（複数回）
- 画像の取得（複数枚）

仮に1回の通信に150ミリ秒かかるとして、20回通信すれば**3秒**。ユーザーは「遅い」と感じ始めます。

> **Note**: 実際に [GCPing](https://gcping.com) で遅延を測定してみましょう。

## 解決策: ユーザーの近くでコードを動かす

### エッジコンピューティングとは

「エッジ（端）」とは、ネットワークの端、つまり**ユーザーに近い場所**のことです。

```
【従来のアーキテクチャ】
ユーザー(東京) ──→ 太平洋を横断 ──→ サーバー(米国)
                                         ↓
ユーザー(東京) ←── 太平洋を横断 ←── レスポンス

　　　　　　　往復で100〜200ms以上

【エッジコンピューティング】
ユーザー(東京) ──→ エッジサーバー(東京) ──→ レスポンス

　　　　　　　往復で10〜30ms程度
```

世界中にサーバーを分散配置し、ユーザーに最も近いサーバーが処理を担当する。これがエッジコンピューティングの基本的な考え方です。

### エッジランタイムとは

エッジコンピューティングを実現するための**実行環境**を「エッジランタイム」と呼びます。

代表的なエッジランタイム:

- **Cloudflare Workers** - 世界300都市以上にサーバーを持つ
- **Deno Deploy** - Deno社が提供するエッジランタイム
- **Vercel Edge Functions** - Next.jsで有名なVercelのエッジランタイム

### エッジランタイムのメリット

| メリット             | 説明                                                   |
| -------------------- | ------------------------------------------------------ |
| **低遅延**           | ユーザーに近い場所で処理するため、体感速度が大幅に向上 |
| **従量課金**         | 使った分だけ支払う。小規模なら月額無料枠で収まることも |
| **自動スケーリング** | アクセスが増えても自動で対応。サーバー管理が不要       |

> **Note**\
> 光の速さを超える通信のためのプロトコル
>
> 2024年 <ruby>4月1日<rt>エイプリルフール</rt></ruby> に「<ruby>Faster Than Light Speed Protocol<rt>光の速さを超える通信のためのプロトコル</rt></ruby> [[RFC 9564](https://www.rfc-editor.org/rfc/rfc9564.html)]」仕様が公開されました。
> このRFCのプロトコルは文字通り「光の速さを超える通信」を可能とするための技術ですが、実装は「まだ」存在しません 😃

## Honoとは何か

Hono（炎）は、TypeScriptで書かれた**軽量・高速なWebフレームワーク**です。

```js
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

export default app;
```

たったこれだけでWebサーバーが完成します。

## Honoの特徴

- **爆速** 🚀 - `RegExpRouter` 速い。逐次処理を用いない。まじ速い。
- **軽量** 🪶 - `hono/tiny` プリセットはわずか 14kB 未満。依存関係ゼロでWeb標準のみ。
- **マルチランタイム** 🌍 - Cloudflare Workers、Fastly Compute、Deno、Bun、AWS Lambda、Node.js。どこのプラットフォームでも同じコードが動く。
- **<ruby>バッテリー同梱<rt>Batteries Included</rt></ruby>** 🔋 - 内蔵のミドルウェア、カスタムミドルウェア、サードパーティのミドルウェア、ヘルパー。いわゆる <ruby>バッテリー同梱<rt>Batteries Included</rt></ruby>。
- **楽しい開発体験** 😃 - 超クリーンAPI。TypeScriptが第一級対応。すぐ"型"付く。

> ### Features
>
> - **Ultrafast** 🚀 - The router `RegExpRouter` is really fast. Not using linear loops. Fast.
> - **Lightweight** 🪶 - The `hono/tiny` preset is under 14kB. Hono has zero dependencies and uses only the Web Standards.
> - **Multi-runtime** 🌍 - Works on Cloudflare Workers, Fastly Compute, Deno, Bun, AWS Lambda, or Node.js. The same code runs on all platforms.
> - **Batteries Included** 🔋 - Hono has built-in middleware, custom middleware, third-party middleware, and helpers. Batteries included.
> - **Delightful DX** 😃 - Super clean APIs. First-class TypeScript support. Now, we've got "Types".
>
> _引用元: <https://hono.dev/docs/#features>_

### なぜ「マルチランタイム」が重要なのか

従来、エッジランタイムごとに異なる書き方が必要でした。

```js
// Cloudflare Workers用
export default { fetch(req, env) { ... } }

// Deno用
Deno.serve((req) => { ... });

// Node.js用
import http from "node:http";
http.createServer((req, res) => { ... });
```

Honoを使えば、**どの環境でも同じコードが動きます**。

```js
// どの環境でもこのコードでOK
import { Hono } from "hono";
const app = new Hono();
app.get("/", (c) => c.text("Hello!"));
export default app;
```

これにより、開発環境はNode.js、本番環境はCloudflare Workers、という構成も簡単に実現できます。

## Honoを使った実践例

### 例1: シンプルなAPIサーバー

```js
import { Hono } from "hono";

const app = new Hono();

// ユーザー一覧を返すAPI
app.get("/api/users", (c) => {
  return c.json([
    { id: 1, name: "田中太郎" },
    { id: 2, name: "山田花子" },
  ]);
});

// 特定のユーザーを返すAPI
app.get("/api/users/:id", (c) => {
  const id = c.req.param("id"); // URLパラメータを取得
  return c.json({ id, name: "田中太郎" });
});

export default app;
```

### 例2: ミドルウェアの活用

ミドルウェアとは、リクエストを処理する「途中の処理」のことです。

```js
import { Hono } from "hono";
import { logger } from "hono/logger"; // ログ出力
import { cors } from "hono/cors"; // CORS対応
import { basicAuth } from "hono/basic-auth"; // Basic認証

const app = new Hono();

// 全リクエストにログを出力
app.use("*", logger());

// /api/* へのリクエストにCORSを許可
app.use("/api/*", cors());

// /admin/* へのリクエストにBasic認証を要求
app.use(
  "/admin/*",
  basicAuth({
    username: "admin",
    password: "secret",
  }),
);

app.get("/api/public", (c) => c.text("誰でもアクセス可能"));
app.get("/admin/dashboard", (c) => c.text("管理者のみアクセス可能"));

export default app;
```

## ポイント

| 概念                         | 説明                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| **エッジコンピューティング** | ユーザーに近い場所でアプリを実行し、遅延を減らす考え方       |
| **エッジランタイム**         | エッジでアプリを動かすための実行環境（Cloudflare Workers等） |
| **Hono**                     | 軽量・高速・マルチランタイム対応のWebフレームワーク          |

## 参考文献

- [Hono公式サイト](https://hono.dev/)
