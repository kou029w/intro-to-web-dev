# Hello Worldとローカル実行

Honoの概要を理解したところで、実際に手を動かして最初のアプリケーションを作成してみましょう。「百聞は一見にしかず」ということで、実践を通じて学んでいきます。

## プロジェクトの初期化

まず、新しいプロジェクトを作成しましょう。

```bash
# 新しいディレクトリを作成
mkdir hono-tutorial
cd hono-tutorial

# package.jsonを初期化
pnpm init

# Honoをインストール
pnpm add hono

# 開発用の依存関係をインストール
pnpm add -D typescript @types/node tsx
```

「tsxは、TypeScriptファイルを直接実行できる便利なツールです。」

## 最初のHello World

`src/index.ts`ファイルを作成します：

```typescript
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
```

「たったこれだけでWebサーバーが完成です！Express.jsを使ったことがある方なら、すぐに理解できますよね。」

## ローカル実行のセットアップ

### Node.js環境での実行

`src/server.ts`ファイルを作成します：

```typescript
import { serve } from "@hono/node-server";
import app from "./index";

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

「`@hono/node-server`をインストールしましょう：」

```bash
pnpm add @hono/node-server
```

### package.jsonの設定

`package.json`のscriptsセクションを更新します：

```json
{
  "name": "hono-tutorial",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "node dist/server.js",
    "build": "tsc"
  },
  "dependencies": {
    "hono": "^3.12.0",
    "@hono/node-server": "^1.8.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.7.0"
  }
}
```

### TypeScript設定

`tsconfig.json`ファイルを作成します：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

## 実行してみよう！

開発サーバーを起動します：

```bash
pnpm dev
```

ブラウザで`http://localhost:3000`にアクセスすると、「Hello Hono!」が表示されます。

ファイルを保存すると自動的にサーバーが再起動される（ホットリロード）ので、開発がとても快適です。

## 基本的なルートを追加

`src/index.ts`を拡張して、いくつかのルートを追加してみましょう：

```typescript
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/hello/:name", (c) => {
  const name = c.req.param("name");
  return c.text(`Hello, ${name}!`);
});

app.get("/json", (c) => {
  return c.json({
    message: "Hello World",
    timestamp: new Date().toISOString(),
  });
});

app.get("/html", (c) => {
  return c.html(`
    <html>
      <head>
        <title>Hono App</title>
      </head>
      <body>
        <h1>Hello from Hono!</h1>
        <p>This is HTML response</p>
      </body>
    </html>
  `);
});

export default app;
```

これで以下のエンドポイントが利用できます：

- `GET /` - テキストレスポンス
- `GET /hello/:name` - パラメータ付きレスポンス
- `GET /json` - JSON レスポンス
- `GET /html` - HTML レスポンス

## さまざまなランタイムでの実行

Honoの魅力の1つは、同じコードが様々な環境で動作することです。

### Bunでの実行

Bunがインストールされている場合：

```typescript
// bun-server.ts
import app from "./src/index";

export default {
  port: 3000,
  fetch: app.fetch,
};
```

実行：

```bash
bun run bun-server.ts
```

### Denoでの実行

```typescript
// deno-server.ts
import app from "./src/index.ts";

Deno.serve(app.fetch);
```

実行：

```bash
deno run --allow-net deno-server.ts
```

同じHonoアプリケーションコードが、Node.js、Bun、Denoで動作します。素晴らしいですね！

## 開発時のTIPS

### 1. ホットリロードの活用

`tsx watch`を使うことで、ファイルの変更を自動的に検知してサーバーを再起動できます：

```bash
pnpm dev
```

### 2. デバッグ情報の表示

開発時は、リクエストの詳細情報を確認したい場合があります：

```typescript
import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

// ログ出力ミドルウェアを追加
app.use("*", logger());

app.get("/", (c) => {
  console.log("Request received:", c.req.url);
  return c.text("Hello Hono!");
});

export default app;
```

### 3. CORSの設定（フロントエンドとの連携時）

フロントエンドアプリケーションから呼び出す場合：

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// CORS設定
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// 以降のルート定義...
```

## エラーのトラブルシューティング

### よくあるエラーと対処法

#### 1. モジュール読み込みエラー

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
```

**対処法：**

- `package.json`に`"type": "module"`が設定されているか確認
- import文でファイル拡張子が正しく指定されているか確認

#### 2. ポートが使用中のエラー

```
Error: listen EADDRINUSE: address already in use :::3000
```

**対処法：**

```bash
# 使用中のプロセスを確認
lsof -i :3000

# または別のポートを使用
serve({
  fetch: app.fetch,
  port: 3001
})
```

#### 3. TypeScriptの型エラー

```
Property 'param' does not exist on type 'HonoRequest'
```

**対処法：**

- `@types/node`がインストールされているか確認
- TypeScript設定が正しいか確認

## ディレクトリ構造の確認

現在のプロジェクト構造は以下のようになっているはずです：

```
hono-tutorial/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts      # メインのアプリケーション
│   └── server.ts     # Node.js用のサーバー起動
├── bun-server.ts     # Bun用（オプション）
└── deno-server.ts    # Deno用（オプション）
```

## 次のステップ

Hello Worldアプリケーションが動作するようになったら、次の章でルーティングについてより詳しく学んでいきましょう。RESTful APIの設計方法や、より複雑なルート定義について説明します。

## やってみよう！

1. **基本的なAPIエンドポイントを追加**

   - `/ping` - "pong"を返すエンドポイント
   - `/time` - 現在時刻を返すエンドポイント

2. **パラメータを使った動的なレスポンス**

   - `/greet/:language/:name` - 言語に応じた挨拶を返すエンドポイント

3. **異なるランタイムでの実行**
   - BunやDenoがインストールされていれば、同じコードで動作確認

## ポイント

- **シンプルなセットアップ**：最小限の設定でHonoアプリケーションを開始
- **ホットリロード**：`tsx watch`による開発効率の向上
- **マルチランタイム対応**：Node.js、Bun、Denoで同じコードが動作
- **型安全性**：TypeScriptによる開発時のエラー検知
- **Express風API**：親しみやすいルート定義方法

## 参考文献

- [Hono Getting Started](https://hono.dev/getting-started)
- [Node.js サーバー設定](https://hono.dev/getting-started/nodejs)
- [TypeScript設定ガイド](https://www.typescriptlang.org/tsconfig)
