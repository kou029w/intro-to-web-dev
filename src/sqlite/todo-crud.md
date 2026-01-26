# ToDoアプリをSQLiteで永続化

SQLの基本を学んだので、いよいよ実践です。Hono + React で作られたToDoアプリのテンプレートを使って、データをSQLiteに永続化していきます。

## 目標

このハンズオンを終えると、以下ができるようになります。

- ToDoの一覧取得（SELECT）
- ToDoの作成（INSERT）
- ToDoの更新（UPDATE）
- ToDoの削除（DELETE）

サーバーを再起動してもデータが消えない、本格的なToDoアプリの完成です。

## ステップ0: テンプレートの準備

テンプレートリポジトリをクローンします。

```bash
git clone https://github.com/kou029w/todo-template.git
cd todo-template
```

依存関係をインストールして、動作確認しましょう。

```bash
pnpm install
pnpm dev
```

ブラウザで <http://localhost:5173> にアクセスすると、ToDoアプリが表示されます。いくつかToDoを追加してみてください。

現状では、サーバーを再起動（`Ctrl+C` で停止して `pnpm dev` で再起動）するとデータが消えてしまいます。これをSQLiteで永続化していきましょう。

## プロジェクト構成の確認

```
todo-template/
├── api/                    # バックエンド（Hono）
│   └── src/
│       └── index.ts        # APIサーバーのコード ← ここを編集
├── web/                    # フロントエンド（React）
│   └── src/
│       └── ...
├── package.json
└── pnpm-workspace.yaml
```

今回編集するのは `api/src/index.ts` だけです。フロントエンドはそのまま使います。

## ステップ1: 現在のコードを確認

`api/src/index.ts` を開いて、現在のコードを確認しましょう。

```ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("/*", cors());

// ToDoのデータ（メモリ上）
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

let todos: Todo[] = [];
let nextId = 1;

// ... 以下、CRUDのエンドポイント
```

`todos` という配列にデータを保存しています。これをSQLiteに置き換えていきます。

## ステップ2: データベースの初期化

まず、データベースの接続とテーブル作成のコードを追加します。

`api/src/index.ts` の先頭部分を以下のように変更します。

```js
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { DatabaseSync } from "node:sqlite";

const app = new Hono();

app.use("/*", cors());

// データベースに接続
using db = new DatabaseSync("todo.db");
const sql = db.createTagStore();

// テーブルを作成（存在しなければ）
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`);

console.log("データベースを初期化しました");
```

**変更点:**

1. `node:sqlite` から `DatabaseSync` をインポート
2. `new DatabaseSync("todo.db")` で `todo.db` ファイルに接続
3. `db.createTagStore()` でSQLを実行するためのストアを作成
4. ``db.exec(`CREATE TABLE IF NOT EXISTS todos (…)`)`` で `todos` テーブル作成

古いメモリベースの変数（`let todos = []` と `let nextId = 1`）は削除します。

## ステップ3: GET /api/todos - 一覧取得

ToDoの一覧を取得するエンドポイントを修正します。

```js
// GET /api/todos - ToDoの一覧を取得
app.get("/api/todos", (c) => {
  const todos = sql.all`SELECT * FROM todos ORDER BY id DESC`;

  // completedをbooleanに変換（SQLiteでは0/1で保存されるため）
  const result = todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    completed: todo.completed === 1,
  }));

  return c.json(result);
});
```

**ポイント:**

- `sql.all` のタグ付きテンプレートで全件取得（前のセクションで学んだ `createTagStore()` の機能）
- `ORDER BY id DESC` で新しい順に並び替え
- SQLiteでは真偽値が `0` / `1` で保存されるので、`boolean` に変換

## ステップ4: GET /api/todos/:id - 1件取得

特定のToDoを取得するエンドポイントを修正します。

```js
// GET /api/todos/:id - 特定のToDoを取得
app.get("/api/todos/:id", (c) => {
  const id = Number(c.req.param("id"));

  const todo = sql.get`SELECT * FROM todos WHERE id = ${id}`;

  if (!todo) {
    return c.json({ error: "Todo not found" }, 404);
  }

  return c.json({
    id: todo.id,
    title: todo.title,
    completed: todo.completed === 1,
  });
});
```

**ポイント:**

- `sql.get` のタグ付きテンプレートで1件取得
- `${id}` で値を埋め込むと、自動的にSQLインジェクション対策される
- `sql.get` は1件だけ返す（見つからなければ `undefined`）

## ステップ5: POST /api/todos - 新規作成

ToDoを作成するエンドポイントを修正します。

```js
// POST /api/todos - 新しいToDoを作成
app.post("/api/todos", async (c) => {
  const body = await c.req.json();

  if (!body.title || body.title.trim() === "") {
    return c.json({ error: "Title is required" }, 400);
  }

  const result = sql.run`INSERT INTO todos (title) VALUES (${body.title})`;

  // 作成したToDoを取得して返す
  const newTodo = sql.get`SELECT * FROM todos WHERE id = ${result.lastInsertRowid}`;

  return c.json(
    {
      id: newTodo.id,
      title: newTodo.title,
      completed: newTodo.completed === 1,
    },
    201,
  );
});
```

**ポイント:**

- `sql.run` のタグ付きテンプレートで INSERT を実行
- `${body.title}` で値を埋め込むと、自動的にSQLインジェクション対策される
- `result.lastInsertRowid` で自動採番されたIDを取得
- 作成したデータを取得して、クライアントに返す

> **Note**: `result.lastInsertRowid` は、INSERT文で自動的に生成されたIDを取得する特別なプロパティです。これを使うことで、作成したばかりのToDoを取得できます。

## ステップ6: PUT /api/todos/:id - 更新

ToDoを更新するエンドポイントを修正します。

```js
// PUT /api/todos/:id - ToDoを更新
app.put("/api/todos/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  // 存在確認
  const existingTodo = sql.get`SELECT * FROM todos WHERE id = ${id}`;

  if (!existingTodo) {
    return c.json({ error: "Todo not found" }, 404);
  }

  // 渡されたフィールドを更新（部分更新）
  if (body.title !== undefined) {
    sql.run`
      UPDATE todos
        SET title = ${body.title}
        WHERE id = ${id}`;
  }

  if (body.completed !== undefined) {
    sql.run`
      UPDATE todos
        SET completed = ${body.completed ? 1 : 0}
        WHERE id = ${id}`;
  }

  // 更新後のデータを取得して返す
  const updatedTodo = sql.get`SELECT * FROM todos WHERE id = ${id}`;

  return c.json({
    id: updatedTodo.id,
    title: updatedTodo.title,
    completed: updatedTodo.completed === 1,
  });
});
```

**ポイント:**

- まず存在確認をする
- 渡されたフィールドだけを更新（部分更新）
- `boolean` を `0` / `1` に変換してから保存
- タグ付きテンプレートで、読みやすく安全なコードになる

> **Note**: `body.title !== undefined` は、「titleプロパティが渡されたかどうか」をチェックしています。これにより、送られてきたフィールドだけを更新できます。

## ステップ7: DELETE /api/todos/:id - 削除

ToDoを削除するエンドポイントを修正します。

```js
// DELETE /api/todos/:id - ToDoを削除
app.delete("/api/todos/:id", (c) => {
  const id = Number(c.req.param("id"));

  // 存在確認
  const existingTodo = sql.get`SELECT * FROM todos WHERE id = ${id}`;

  if (!existingTodo) {
    return c.json({ error: "Todo not found" }, 404);
  }

  // 削除
  const result = sql.run`DELETE FROM todos WHERE id = ${id}`;

  return c.json({ message: "Deleted" });
});
```

**ポイント:**

- 削除前に存在確認
- `sql.run` のタグ付きテンプレートで DELETE を実行
- `result.changes` で削除された行数を確認できる（今回は使っていません）

## 完成コード

すべての修正を反映した `api/src/index.ts` の完成版です。

```js
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { DatabaseSync } from "node:sqlite";

const app = new Hono();

app.use("/*", cors());

// データベースに接続（using構文で自動的にcloseされる）
using db = new DatabaseSync("todo.db");
const sql = db.createTagStore();

// テーブルを作成（存在しなければ）
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`);

console.log("データベースを初期化しました");

// GET /api/todos - ToDoの一覧を取得
app.get("/api/todos", (c) => {
  const todos = sql.all`SELECT * FROM todos ORDER BY id DESC`;

  const result = todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    completed: todo.completed === 1,
  }));

  return c.json(result);
});

// GET /api/todos/:id - 特定のToDoを取得
app.get("/api/todos/:id", (c) => {
  const id = Number(c.req.param("id"));

  const todo = sql.get`SELECT * FROM todos WHERE id = ${id}`;

  if (!todo) {
    return c.json({ error: "Todo not found" }, 404);
  }

  return c.json({
    id: todo.id,
    title: todo.title,
    completed: todo.completed === 1,
  });
});

// POST /api/todos - 新しいToDoを作成
app.post("/api/todos", async (c) => {
  const body = await c.req.json();

  if (!body.title || body.title.trim() === "") {
    return c.json({ error: "Title is required" }, 400);
  }

  const result = sql.run`INSERT INTO todos (title) VALUES (${body.title})`;

  const newTodo = sql.get`SELECT * FROM todos WHERE id = ${result.lastInsertRowid}`;

  return c.json(
    {
      id: newTodo.id,
      title: newTodo.title,
      completed: newTodo.completed === 1,
    },
    201,
  );
});

// PUT /api/todos/:id - ToDoを更新
app.put("/api/todos/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  const existingTodo = sql.get`SELECT * FROM todos WHERE id = ${id}`;

  if (!existingTodo) {
    return c.json({ error: "Todo not found" }, 404);
  }

  if (body.title !== undefined) {
    sql.run`UPDATE todos SET title = ${body.title} WHERE id = ${id}`;
  }

  if (body.completed !== undefined) {
    sql.run`UPDATE todos SET completed = ${
      body.completed ? 1 : 0
    } WHERE id = ${id}`;
  }

  const updatedTodo = sql.get`SELECT * FROM todos WHERE id = ${id}`;

  return c.json({
    id: updatedTodo.id,
    title: updatedTodo.title,
    completed: updatedTodo.completed === 1,
  });
});

// DELETE /api/todos/:id - ToDoを削除
app.delete("/api/todos/:id", (c) => {
  const id = Number(c.req.param("id"));

  const existingTodo = sql.get`SELECT * FROM todos WHERE id = ${id}`;

  if (!existingTodo) {
    return c.json({ error: "Todo not found" }, 404);
  }

  const result = sql.run`DELETE FROM todos WHERE id = ${id}`;

  return c.json({ message: "Deleted" });
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

## 動作確認

サーバーを再起動して、動作を確認しましょう。

```bash
pnpm dev
```

1. ブラウザで [http://localhost:5173](http://localhost:5173) にアクセス
2. いくつかToDoを追加
3. `Ctrl+C` でサーバーを停止
4. `pnpm dev` で再起動
5. **ToDoが残っていることを確認！**

`api/` ディレクトリに `todo.db` ファイルが作成されているはずです。これがSQLiteのデータベースファイルです。

## やってみよう！

1. ToDoを追加して、サーバーを再起動してもデータが残ることを確認
2. ToDoの完了/未完了を切り替えて、再起動後も状態が保持されることを確認
3. `todo.db` を削除してからサーバーを起動すると、空のToDoリストになることを確認

## ポイント

- **永続化**: データをファイル（データベース）に保存することで、サーバー再起動後もデータが残る
- **型変換**: SQLiteの `INTEGER`（0/1）とJavaScriptの `boolean` の変換が必要
- `sql.run`: INSERT/UPDATE/DELETEを実行するために使用
  - `result.lastInsertRowid`: INSERTで自動生成されたIDを取得
  - `result.changes`: UPDATE/DELETEで影響を受けた行数を取得

## 早く進んだ人向け

Honoの公式ドキュメントには、ベストプラクティスがまとめられています。余裕があれば読んでみてください。

- [Hono Best Practices](https://hono.dev/docs/guides/best-practices)

特に以下のトピックが参考になります。

- ルーティングの整理方法
- ミドルウェアの活用
- エラーハンドリング

## 参考文献

- [todo-template リポジトリ](https://github.com/kou029w/todo-template)
- [Node.js SQLite documentation](https://nodejs.org/api/sqlite.html)
