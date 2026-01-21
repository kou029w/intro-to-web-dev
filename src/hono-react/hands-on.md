# HonoとReactアプリを連携させよう

実際にHono (バックエンド) とReact (フロントエンド) を連携させてみましょう。2つの独立したプロジェクトを作成し、APIを通じてデータをやり取りします。

## この演習の流れ

1. **Step 1**: Honoでバックエンドを作成する
2. **Step 2**: Reactでフロントエンドを作成する
3. **Step 3**: CORSエラーを解決する

すべて完了すると、「React画面からHono APIを呼び出してデータを表示する」アプリが動きます。

## 作業ディレクトリの準備

まず、今回の演習用のディレクトリを作成します。

```bash
mkdir hono-react-demo
cd hono-react-demo
```

この中に `api` (バックエンド) と `web` (フロントエンド) の2つのプロジェクトを作ります。

```
hono-react-demo/
├── api/    # Hono (バックエンド)
└── web/    # React (フロントエンド)
```

## Step 1: Honoでバックエンドを作成する

まず、APIサーバーを作ります。

### 1-1. プロジェクト作成

```bash
pnpm create hono@latest api
```

対話形式で質問されます。以下のように選択してください。

```
Which template do you want to use? … nodejs
Do you want to install project dependencies? … yes
Which package manager do you want to use? … pnpm
```

### 1-2. APIエンドポイントを作成

作成されたディレクトリに移動して、コードを編集します。

```bash
cd api
```

`src/index.ts` を以下のように書き換えます。

```ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

// /api/hello エンドポイント
app.get("/api/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
    timestamp: new Date().toISOString(),
  });
});

const port = 3000;
console.log(`API Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

### 1-3. 動作確認

開発サーバーを起動します。

```bash
pnpm dev
```

ブラウザで [http://localhost:3000/api/hello](http://localhost:3000/api/hello) にアクセスしてみましょう。

```json
{
  "message": "Hello from Hono!",
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

このようなJSONが表示されれば成功です。**このターミナルは開いたまま**にしておいてください。

## Step 2: Reactでフロントエンドを作成する

次に、Reactアプリを作ります。**新しいターミナル**を開いてください。

### 2-1. プロジェクト作成

`hono-react-demo` ディレクトリに戻ります。

```bash
cd /path/to/hono-react-demo
```

Reactプロジェクトを作成します。

```bash
pnpm create vite@latest web --template react-ts
```

### 2-2. 依存関係のインストール

```bash
cd web
pnpm install
```

### 2-3. APIを呼び出すコードを書く

`src/App.tsx` を以下のように書き換えます。

```ts tsx
import { useEffect, useState } from "react";

// APIレスポンスの型定義
type HelloResponse = {
  message: string;
  timestamp: string;
};

function App() {
  const [data, setData] = useState<HelloResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hono APIを呼び出す
    fetch("http://localhost:3000/api/hello")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Hono + React Demo</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data ? (
        <div>
          <p>
            <strong>Message:</strong> {data.message}
          </p>
          <p>
            <strong>Timestamp:</strong> {data.timestamp}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
```

### 2-4. 開発サーバーを起動

```bash
pnpm dev
```

ブラウザで [http://localhost:5173](http://localhost:5173) にアクセスします。

### 2-5. CORSエラーに遭遇！

画面を見ると…**エラーが表示されています！**

ブラウザの開発者ツール (F12) を開いて、Consoleタブを確認してみましょう。

```
Access to fetch at 'http://localhost:3000/api/hello' from origin
'http://localhost:5173' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

これが**CORSエラー**です。ReactとHonoはポート番号が違うため、別のオリジンとして扱われています。ブラウザのセキュリティ機能により、リクエストがブロックされているのです (詳しくは[概要](overview.md)を参照) 。

## Step 3: CORSエラーを解決する

Honoに `cors()` ミドルウェアを追加して、Reactからのリクエストを許可しましょう。

### 3-1. Honoのコードを修正

**Honoのターミナル**で一度 `Ctrl+C` でサーバーを停止してください。

`api/src/index.ts` を以下のように修正します。

```ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors"; // 追加

const app = new Hono();

// CORSミドルウェアを適用
app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173", // Reactのオリジンを許可
  }),
);

// /api/hello エンドポイント
app.get("/api/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
    timestamp: new Date().toISOString(),
  });
});

const port = 3000;
console.log(`API Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

### 3-2. 再起動して確認

```bash
pnpm dev
```

ブラウザで [http://localhost:5173](http://localhost:5173) をリロードしてみましょう。

```
Hono + React Demo

Message: Hello from Hono!
Timestamp: 2025-01-20T12:00:00.000Z
```

データが表示されました！

### 3-3. 何が変わったの？

開発者ツールの「Network」タブで `/api/hello` へのリクエストを確認すると、レスポンスヘッダーに以下が追加されています。

```
Access-Control-Allow-Origin: http://localhost:5173
```

このヘッダーにより、ブラウザは「このリクエストはサーバーが許可している」と判断し、データを受け取れるようになりました。

## cors()ミドルウェアのオプション

`cors()` ミドルウェアにはいくつかの設定オプションがあります。

### 複数のオリジンを許可

```ts
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3001"],
  }),
);
```

### すべてのオリジンを許可 (開発用)

```ts
app.use(
  "/api/*",
  cors({
    origin: "*", // 全オリジン許可 (本番では非推奨)
  }),
);
```

> **注意**: `origin: "*"` は開発時には便利ですが、本番環境では具体的なオリジンを指定しましょう。

### 認証情報 (Cookie等) を含める場合

```ts
app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Cookieなどを許可
  }),
);
```

## 完成コード

### Hono (api/src/index.ts)

```ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173",
  }),
);

app.get("/api/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
    timestamp: new Date().toISOString(),
  });
});

const port = 3000;
console.log(`API Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

### React (web/src/App.tsx)

```ts tsx
import { useEffect, useState } from "react";

type HelloResponse = {
  message: string;
  timestamp: string;
};

function App() {
  const [data, setData] = useState<HelloResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/hello")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Hono + React Demo</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data ? (
        <div>
          <p>
            <strong>Message:</strong> {data.message}
          </p>
          <p>
            <strong>Timestamp:</strong> {data.timestamp}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
```

## やってみよう！

演習が完了したら、以下を試してみましょう。

### 1. 別のエンドポイントを追加する

Honoに `/api/time` エンドポイントを追加して、現在時刻だけを返すようにしてみましょう。

```ts
app.get("/api/time", (c) => {
  return c.json({
    time: new Date().toLocaleTimeString("ja-JP"),
  });
});
```

### 2. Reactで呼び出す

React側でボタンをクリックしたら `/api/time` を呼び出すように改修してみましょう。

### 3. CORSを外してエラーを確認

`cors()` ミドルウェアをコメントアウトして、再びCORSエラーが発生することを確認してみましょう。

## プロジェクトの再現手順 (まとめ)

復習時にすぐ再現できるよう、全手順をまとめておきます。

```bash
# 1. 作業ディレクトリ作成
mkdir hono-react-demo && cd hono-react-demo

# 2. Honoプロジェクト作成
pnpm create hono@latest api
# → nodejs, yes, pnpm を選択

# 3. Reactプロジェクト作成
pnpm create vite@latest web --template react-ts
cd web && pnpm install && cd ..

# 4. Honoのコードを編集 (cors()を追加)
# api/src/index.ts を編集

# 5. Reactのコードを編集 (fetch追加)
# web/src/App.tsx を編集

# 6. 両方のサーバーを起動 (別々のターミナルで)
# ターミナル1: cd api && pnpm dev
# ターミナル2: cd web && pnpm dev

# 7. http://localhost:5173 で確認
```

## ポイント

### Honoのcors()ミドルウェア

- **`cors()`**: CORSを有効にするミドルウェア
- **`origin`**: 許可するオリジンを指定 (文字列または配列)
- **`credentials`**: Cookie等の認証情報を含める場合は `true`
- **`"*"`**: 全オリジン許可 (開発用、本番非推奨)

### 開発時の構成

- **バックエンド (Hono)**: ポート3000で起動
- **フロントエンド (React)**: ポート5173で起動 (Viteのデフォルト)
- **異なるポート = 異なるオリジン** → CORSの設定が必要

## 参考文献

- [Hono CORS Middleware](https://hono.dev/docs/middleware/builtin/cors)
- [MDN: オリジン間リソース共有 (CORS)](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS)
- [Vite](https://ja.vitejs.dev/)
