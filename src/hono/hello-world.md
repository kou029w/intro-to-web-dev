# Hello Worldとローカル実行

Honoの概要を理解したところで、実際に手を動かしてみましょう。Hono CLIを使えば、数コマンドでプロジェクトを作成できます。

## プロジェクトの作成

ターミナルを開いて、以下のコマンドを実行します。

```bash
pnpm create hono@latest
```

対話形式でいくつかの質問が表示されます。

```
Target directory … my-hono-app
Which template do you want to use? … nodejs
Do you want to install project dependencies? … yes
Which package manager do you want to use? … pnpm
```

- **Target directory**: プロジェクト名を入力（例: `my-hono-app`）
- **template**: `nodejs` を選択
- **dependencies**: `yes` を選択
- **package manager**: `pnpm` を選択

これだけで、Honoプロジェクトの雛形が完成します。

## プロジェクトの中身を確認

作成されたディレクトリに移動して、中身を見てみましょう。

```bash
cd my-hono-app
```

以下のようなファイル構成になっています。

```
my-hono-app/
├── src/
│   └── index.ts      # アプリケーションのメインファイル
├── package.json
└── tsconfig.json
```

`src/index.ts` の中身を確認してみましょう。

```typescript
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
```

たったこれだけでWebサーバーが完成しています。1つずつ見ていきましょう。

### コードの解説

```typescript
const app = new Hono()
```

Honoアプリケーションのインスタンスを作成しています。

```typescript
app.get('/', (c) => {
  return c.text('Hello Hono!')
})
```

`GET /` へのリクエストを処理するルートを定義しています。`c` はContext（コンテキスト）オブジェクトで、リクエストやレスポンスを操作するためのメソッドが含まれています。

```typescript
serve({
  fetch: app.fetch,
  port
})
```

Node.js環境でHTTPサーバーを起動しています。

## 開発サーバーを起動しよう

以下のコマンドで開発サーバーを起動します。

```bash
pnpm dev
```

ターミナルに以下のようなメッセージが表示されます。

```
Server is running on http://localhost:3000
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてみましょう。「Hello Hono!」と表示されれば成功です。

## やってみよう！

コードを少し変更して、変化を確認してみましょう。

### 1. メッセージを変えてみる

`src/index.ts` の `c.text('Hello Hono!')` を好きなメッセージに変更してみましょう。

```typescript
app.get('/', (c) => {
  return c.text('こんにちは、Hono！')
})
```

ファイルを保存すると、自動的にサーバーが再起動されます（ホットリロード）。ブラウザをリロードして変化を確認してみてください。

### 2. 新しいルートを追加してみる

`/hello` というパスにアクセスしたときに別のメッセージを返すルートを追加してみましょう。

```typescript
app.get('/', (c) => {
  return c.text('こんにちは、Hono！')
})

// 新しいルートを追加
app.get('/hello', (c) => {
  return c.text('Hello from /hello!')
})
```

ブラウザで [http://localhost:3000/hello](http://localhost:3000/hello) にアクセスして確認してみましょう。

### 3. JSONレスポンスを試してみる

`c.text()` の代わりに `c.json()` を使うと、JSONを返せます。

```typescript
app.get('/api', (c) => {
  return c.json({ message: 'Hello API!' })
})
```

ブラウザで [http://localhost:3000/api](http://localhost:3000/api) にアクセスすると、JSONが表示されます。

## ポイント

- **Hono CLI**: `pnpm create hono@latest` で簡単にプロジェクトを作成
- **ホットリロード**: ファイル保存で自動的にサーバーが再起動
- **`c.text()`**: テキストレスポンスを返す
- **`c.json()`**: JSONレスポンスを返す
- **ルート定義**: `app.get('/path', ...)` でパスとハンドラを紐づける

## 参考文献

- [Hono Getting Started](https://hono.dev/docs/getting-started/basic)
- [Hono CLI](https://github.com/honojs/create-hono)
