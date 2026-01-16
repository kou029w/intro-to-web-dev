# REST APIを作ろう

Hello Worldができたら、次は本格的なREST APIを作ってみましょう。シンプルなToDoリストAPIを題材に、HTTPメソッド、ステータスコード、JSONの送受信を学んでいきます。

## REST APIとは

REST API は、HTTPメソッド（GET, POST, PUT, DELETE など）を使ってデータを操作するAPIの設計スタイルです。

| HTTPメソッド | 用途 | 例 |
|-------------|------|-----|
| GET | データの取得 | ユーザー一覧を取得 |
| POST | データの作成 | 新しいユーザーを登録 |
| PUT | データの更新 | ユーザー情報を変更 |
| DELETE | データの削除 | ユーザーを削除 |

## 準備：プロジェクトのセットアップ

前章で作成した `my-hono-app` を引き続き使います。`src/index.ts` を以下のように書き換えましょう。

```typescript
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

// ToDoリストのデータ（メモリ上に保持）
interface Todo {
  id: number
  title: string
  completed: boolean
}

let todos: Todo[] = [
  { id: 1, title: '牛乳を買う', completed: false },
  { id: 2, title: 'Honoを学ぶ', completed: true }
]
let nextId = 3

// ルートを定義していく

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
```

これでToDoデータを管理する準備ができました。データベースは使わず、メモリ上の配列でデータを保持します。

## ステップ1：GET - 一覧を取得する

まず、ToDoの一覧を取得するAPIを作りましょう。

```typescript
// GET /todos - ToDoの一覧を取得
app.get('/todos', (c) => {
  return c.json(todos)
})
```

サーバーを起動して確認してみましょう。

```bash
pnpm dev
```

ブラウザで [http://localhost:3000/todos](http://localhost:3000/todos) にアクセスすると、ToDoの一覧がJSONで表示されます。

```json
[
  { "id": 1, "title": "牛乳を買う", "completed": false },
  { "id": 2, "title": "Honoを学ぶ", "completed": true }
]
```

### curlで確認してみよう

ターミナルからAPIを呼び出すこともできます。別のターミナルを開いて以下を実行してみましょう。

```bash
curl http://localhost:3000/todos
```

## ステップ2：GET - パスパラメータで1件取得

次に、特定のToDoを取得するAPIを作ります。`/todos/1` のようにIDを指定してアクセスします。

```typescript
// GET /todos/:id - 特定のToDoを取得
app.get('/todos/:id', (c) => {
  const id = Number(c.req.param('id'))
  const todo = todos.find((t) => t.id === id)

  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  return c.json(todo)
})
```

### ポイント解説

**パスパラメータの取得**

```typescript
const id = c.req.param('id')
```

`/todos/:id` の `:id` 部分をパスパラメータと呼びます。`c.req.param('id')` で値を取得できます。

**HTTPステータスコード**

```typescript
return c.json({ error: 'Todo not found' }, 404)
```

`c.json()` の第2引数でステータスコードを指定できます。404は「見つかりません」を意味します。

### 確認してみよう

```bash
# 存在するToDo
curl http://localhost:3000/todos/1

# 存在しないToDo（404が返る）
curl http://localhost:3000/todos/999
```

## ステップ3：POST - 新しいToDoを作成

クライアントからJSONを受け取って、新しいToDoを作成するAPIを追加します。

```typescript
// POST /todos - 新しいToDoを作成
app.post('/todos', async (c) => {
  const body = await c.req.json()

  const newTodo: Todo = {
    id: nextId++,
    title: body.title,
    completed: false
  }

  todos.push(newTodo)

  return c.json(newTodo, 201)
})
```

### ポイント解説

**リクエストボディの取得**

```typescript
const body = await c.req.json()
```

クライアントから送られてきたJSONを `c.req.json()` で取得します。`await` が必要なので、ハンドラを `async` にしています。

**201 Created**

```typescript
return c.json(newTodo, 201)
```

リソースが新しく作成されたときは、200 OKではなく 201 Created を返すのが慣習です。

### 確認してみよう

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "TypeScriptを勉強する"}'
```

一覧を取得して、追加されたことを確認しましょう。

```bash
curl http://localhost:3000/todos
```

## ステップ4：PUT - ToDoを更新

既存のToDoを更新するAPIを追加します。

```typescript
// PUT /todos/:id - ToDoを更新
app.put('/todos/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()

  const todo = todos.find((t) => t.id === id)

  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  // 渡された値で更新（undefinedでなければ）
  if (body.title !== undefined) todo.title = body.title
  if (body.completed !== undefined) todo.completed = body.completed

  return c.json(todo)
})
```

### 確認してみよう

```bash
# ToDoを完了状態にする
curl -X PUT http://localhost:3000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# 確認
curl http://localhost:3000/todos/1
```

## ステップ5：DELETE - ToDoを削除

最後に、ToDoを削除するAPIを追加します。

```typescript
// DELETE /todos/:id - ToDoを削除
app.delete('/todos/:id', (c) => {
  const id = Number(c.req.param('id'))
  const index = todos.findIndex((t) => t.id === id)

  if (index === -1) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  todos.splice(index, 1)

  return c.text('Deleted', 200)
})
```

### ポイント解説

**テキストレスポンスとステータスコード**

```typescript
return c.text('Deleted', 200)
```

`c.text()` でもステータスコードを指定できます。削除成功時は 200 OK や 204 No Content を返すのが一般的です。

### 確認してみよう

```bash
# 削除
curl -X DELETE http://localhost:3000/todos/1

# 一覧を確認（ID:1が消えている）
curl http://localhost:3000/todos
```

## 完成コード

ここまでの内容をまとめた完成版のコードです。

```typescript
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

interface Todo {
  id: number
  title: string
  completed: boolean
}

let todos: Todo[] = [
  { id: 1, title: '牛乳を買う', completed: false },
  { id: 2, title: 'Honoを学ぶ', completed: true }
]
let nextId = 3

// GET /todos - 一覧取得
app.get('/todos', (c) => {
  return c.json(todos)
})

// GET /todos/:id - 1件取得
app.get('/todos/:id', (c) => {
  const id = Number(c.req.param('id'))
  const todo = todos.find((t) => t.id === id)

  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  return c.json(todo)
})

// POST /todos - 新規作成
app.post('/todos', async (c) => {
  const body = await c.req.json()

  const newTodo: Todo = {
    id: nextId++,
    title: body.title,
    completed: false
  }

  todos.push(newTodo)

  return c.json(newTodo, 201)
})

// PUT /todos/:id - 更新
app.put('/todos/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()

  const todo = todos.find((t) => t.id === id)

  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  if (body.title !== undefined) todo.title = body.title
  if (body.completed !== undefined) todo.completed = body.completed

  return c.json(todo)
})

// DELETE /todos/:id - 削除
app.delete('/todos/:id', (c) => {
  const id = Number(c.req.param('id'))
  const index = todos.findIndex((t) => t.id === id)

  if (index === -1) {
    return c.json({ error: 'Todo not found' }, 404)
  }

  todos.splice(index, 1)

  return c.text('Deleted', 200)
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
```

## やってみよう！

完成したAPIを使って、以下を試してみましょう。

1. **新しいToDoを3つ追加する**
2. **追加したToDoを完了状態にする**
3. **完了したToDoを削除する**
4. **存在しないIDにアクセスして404エラーを確認する**

### 発展課題

余裕があれば、以下の機能を追加してみましょう。

- 完了済みのToDoだけを取得する `GET /todos?completed=true`
- タイトルが空の場合にエラーを返す（バリデーション）

## ポイント

- **`c.json(data)`**: JSONレスポンスを返す
- **`c.json(data, status)`**: ステータスコード付きでJSONを返す
- **`c.text(message, status)`**: テキストレスポンスを返す
- **`c.req.param('name')`**: パスパラメータを取得
- **`c.req.json()`**: リクエストボディのJSONを取得（`await` が必要）

### よく使うHTTPステータスコード

| コード | 意味 | 使いどころ |
|--------|------|----------|
| 200 | OK | 正常に処理完了 |
| 201 | Created | 新しいリソースを作成した |
| 400 | Bad Request | リクエストが不正 |
| 404 | Not Found | リソースが見つからない |
| 500 | Internal Server Error | サーバー内部エラー |

## 参考文献

- [Hono Routing](https://hono.dev/docs/api/routing)
- [Hono Context](https://hono.dev/docs/api/context)
- [HTTP ステータスコード - MDN](https://developer.mozilla.org/ja/docs/Web/HTTP/Status)
