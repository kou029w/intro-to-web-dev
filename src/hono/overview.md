# Honoとエッジランタイム

Web開発のフレームワークの世界で、最近注目を集めているHono（炎）について学んでいきましょう。
Honoにはエッジランタイムにぴったりな特徴があります。

## Honoとは何か？

HonoはTypeScriptで書かれた、モダンで軽量なWebフレームワークです。

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

## エッジランタイムとは？

### 従来のサーバー構成の課題

従来、Webアプリケーションは典型的には以下のような構成でした:

- **通信速度の地理的限界**: 光の速度を超えることは原理的に不可能。ユーザーからサーバーまでの距離が遠いと遅延増加。
- **スケールの限界**: サーバーへのトラフィック増加が加速するとサーバー負荷が増大。リソース不足や応答遅延に
- **グローバル展開の困難さ**: 世界中のユーザーに均一な体験を提供するのが難しい。サーバーのデプロイが開発者の負担に

> **Note**\
> 光の速さを超える通信のためのプロトコル
>
> 2024年 <ruby>4月1日<rt>エイプリルフール</rt></ruby> に「<ruby>Faster Than Light Speed Protocol<rt>光の速さを超える通信のためのプロトコル</rt></ruby> [[RFC 9564](https://www.rfc-editor.org/rfc/rfc9564.html)]」仕様が公開されました。
> このRFCのプロトコルは文字通り「光の速さを超える通信」を可能とするための技術ですが、実装は「まだ」存在しません 😃

### エッジコンピューティングとエッジランタイム

エッジコンピューティングとは、それらの課題を解決するために、ユーザーに物理的に近い場所 (エッジ) でアプリケーションを実行する考え方です。

```
従来のアーキテクチャ:
ユーザー (東京) → (インターネット) → サーバー (米国) → (インターネット) → レスポンス (東京)

エッジコンピューティングアーキテクチャ:
ユーザー（東京） → Edge（東京） → レスポンス
```

そして、「エッジランタイム」とはエッジコンピューティング環境でのアプリケーションの実行をする言語やランタイムのことを指します。

### エッジランタイムの利点

1. **低遅延**
   - ユーザーに近い場所で処理を実行
   - 体感速度の大幅な向上
2. **従量課金**
   - 使用した分だけ支払うモデル
   - コスト効率の良い運用が可能
3. **グローバルな自動スケーリング**
   - トラフィックに応じて自動でリソースを調整
   - 高可用性と耐障害性の向上

## Honoがエッジランタイムで輝く理由

### 1. マルチランタイム対応

Honoは様々なランタイムで動作します。

- Cloudflare Workers:
- Fastly Compute
- Deno
- Bun
- AWS Lambda
- Node.js

どこのプラットフォームでも同じコードが動くため、開発者は一つのコードベースで開発できます。

### 2. 軽量設計

```javascript
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

export default app;
```

このシンプルなコードでWebサーバーが完成。バンドルサイズは驚くほど小さく、エッジランタイムでの起動時間を最小限に抑えます。

### 3. 型安全な開発体験

```typescript
import { Hono } from "hono";

const app = new Hono();

app.get("/api/users/:id", (c) => {
  const id = c.req.param("id"); // 型安全にパラメータを取得
  return c.json({ id, name: "John Doe" });
});
```

TypeScriptとの親和性が高く、開発時のミスを防げます。

## 実際のエッジランタイムでの活用例

### API Gateway

```typescript
const app = new Hono();

// 認証ミドルウェア
app.use("/api/*", async (c, next) => {
  const token = c.req.header("Authorization");
  // トークン検証ロジック
  await next();
});

// リクエストの振り分け
app.get("/api/users/*", (c) => {
  // ユーザー関連のAPIへプロキシ
});

app.get("/api/products/*", (c) => {
  // 商品関連のAPIへプロキシ
});
```

認証やルーティングを処理するAPI GatewayとしてHonoを活用。

### 静的サイトへの動的な機能

```typescript
import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// 静的ファイルの配信
app.use('/*', serveStatic({ root: './dist' }))

// 動的なAPIエンドポイント
app.get('/api/search', async (c) => {
  const query = c.req.query('q')
  // 検索処理
  return c.json({ results: [...] })
})
```

## ポイント

- **Hono**：モダンで軽量なWebフレームワーク
- **エッジコンピューティング**：ユーザーに近い場所でアプリケーションを実行する考え方
- **エッジランタイム**：エッジコンピューティング環境でのアプリケーションを実行する言語やランタイム
- **Honoの利点**：マルチランタイム対応、軽量設計、型安全な開発体験

## 参考文献

- [Hono公式サイト](https://hono.dev/)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- [Deno Deploy documentation](https://deno.com/deploy/docs)
