# SQLの基本

SQLite を使う準備ができたので、SQLの基本を学んでいきましょう。SQL（Structured Query Language）は、データベースを操作するための言語です。

## SQLの4大操作: CRUD

データベース操作は、基本的に4つの操作に分類できます。これを **CRUD**（クラッド）と呼びます。

| 操作       | SQL文  | 意味             |
| ---------- | ------ | ---------------- |
| **C**reate | INSERT | データを作成する |
| **R**ead   | SELECT | データを読み取る |
| **U**pdate | UPDATE | データを更新する |
| **D**elete | DELETE | データを削除する |

REST APIの HTTPメソッドと対応していますね。

| CRUD   | SQL    | HTTP   |
| ------ | ------ | ------ |
| Create | INSERT | POST   |
| Read   | SELECT | GET    |
| Update | UPDATE | PUT    |
| Delete | DELETE | DELETE |

## 準備: 練習用のプロジェクト

SQLを練習するためのプロジェクトを作成しましょう。

```sh
mkdir sql-basics
cd sql-basics
pnpm init --init-type=module
```

## テーブルの作成: CREATE TABLE

まず、データを格納する「テーブル」を作成します。テーブルはExcelのシートのようなもので、列（カラム）と行（レコード）でデータを管理します。

`create-table.js` を作成します。

```js
import { DatabaseSync } from "node:sqlite";

using db = new DatabaseSync("todo.db");

// todosテーブルを作成
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log("todosテーブルを作成しました");

// スコープを抜けると自動的にdb.close()が呼ばれる
```

実行しましょう。

```sh
node create-table.js
```

### CREATE TABLE の構文

```sql
CREATE TABLE IF NOT EXISTS テーブル名 (
  カラム名 データ型 制約,
  カラム名 データ型 制約,
  ...
);
```

### よく使うデータ型

| データ型 | 説明           | 例                  |
| -------- | -------------- | ------------------- |
| INTEGER  | 整数           | 1, 42, -10          |
| TEXT     | 文字列         | "Hello", "田中太郎" |
| REAL     | 小数           | 3.14, 0.5           |
| BLOB     | バイナリデータ | 画像、ファイルなど  |

### よく使う制約

| 制約          | 説明                   |
| ------------- | ---------------------- |
| PRIMARY KEY   | 主キー（一意の識別子） |
| AUTOINCREMENT | 自動で連番を振る       |
| NOT NULL      | NULLを許可しない       |
| DEFAULT 値    | デフォルト値を設定     |
| UNIQUE        | 重複を許可しない       |

## データの追加: INSERT

テーブルにデータを追加してみましょう。`insert.js` を作成します。

```js
import { DatabaseSync } from "node:sqlite";

using db = new DatabaseSync("todo.db");
const sql = db.createTagStore();

// データを追加
sql.run`INSERT INTO todos (title) VALUES (${"牛乳を買う"})`;
sql.run`INSERT INTO todos (title) VALUES (${"Honoを学ぶ"})`;
sql.run`INSERT INTO todos (title) VALUES (${"SQLを理解する"})`;

console.log("3件のToDoを追加しました");
```

実行します。

```sh
node insert.js
```

### INSERT の構文

```sql
INSERT INTO テーブル名 (カラム1, カラム2, ...) VALUES (値1, 値2, ...);
```

### データを挿入

```js
const title = "牛乳を買う";
sql.run`INSERT INTO todos (title) VALUES (${title})`;
```

`${}` の中に値を埋め込むと、自動的に **SQLインジェクション対策**がされます。直接文字列を埋め込むのは **絶対にやめましょう**。

```js
// ダメな例（SQLインジェクションの危険）
const title = "牛乳を買う";
db.exec(`INSERT INTO todos (title) VALUES ('${title}')`);

// 良い例（タグ付きテンプレートを使う）
const sql = db.createTagStore();
sql.run`INSERT INTO todos (title) VALUES (${title})`;
```

## データの取得: SELECT

データを取得してみましょう。`select.js` を作成します。

```js
import { DatabaseSync } from "node:sqlite";

using db = new DatabaseSync("todo.db");
const sql = db.createTagStore();

// 全件取得
const todos = sql.all`SELECT * FROM todos`;

console.log("全てのToDo:");
console.log(todos);
```

実行します。

```sh
node select.js
```

```
$ node select.js
全てのToDo:
[
  [Object: null prototype] {
    id: 1,
    title: '牛乳を買う',
    completed: 0,
    created_at: '2026-01-26 08:50:12'
  },
  [Object: null prototype] {
    id: 2,
    title: 'Honoを学ぶ',
    completed: 0,
    created_at: '2026-01-26 08:50:12'
  },
  [Object: null prototype] {
    id: 3,
    title: 'SQLを理解する',
    completed: 0,
    created_at: '2026-01-26 08:50:12'
  }
]
```

### SELECT の構文

```sql
-- 全カラムを取得
SELECT * FROM テーブル名;

-- 特定のカラムだけ取得
SELECT カラム1, カラム2 FROM テーブル名;
```

### 条件を指定する: WHERE

特定の条件に合うデータだけを取得できます。

```js
import { DatabaseSync } from "node:sqlite";

using db = new DatabaseSync("todo.db");
const sql = db.createTagStore();

// IDで1件取得
const todo = sql.get`SELECT * FROM todos WHERE id = ${1}`;
console.log("ID=1のToDo:", todo);

// 未完了のToDoだけ取得
const incompleteTodos = sql.all`SELECT * FROM todos WHERE completed = ${0}`;
console.log("未完了のToDo:", incompleteTodos);
```

### WHERE で使える演算子

| 演算子       | 意味           | 例                               |
| ------------ | -------------- | -------------------------------- |
| =            | 等しい         | `WHERE id = 1`                   |
| != または <> | 等しくない     | `WHERE completed != 1`           |
| <            | より小さい     | `WHERE id < 5`                   |
| >            | より大きい     | `WHERE id > 2`                   |
| <=           | 以下           | `WHERE id <= 3`                  |
| >=           | 以上           | `WHERE id >= 2`                  |
| LIKE         | パターンマッチ | `WHERE title LIKE '%買う%'`      |
| IN           | リスト内にある | `WHERE id IN (1, 2, 3)`          |
| AND          | かつ           | `WHERE completed = 0 AND id > 1` |
| OR           | または         | `WHERE id = 1 OR id = 2`         |

### 並び替え: ORDER BY

```js
// IDの降順（新しい順）で取得
const todosDesc = sql.all`SELECT * FROM todos ORDER BY id DESC`;

// タイトルの昇順（あいうえお順）で取得
const todosAsc = sql.all`SELECT * FROM todos ORDER BY title ASC`;
```

### 件数を制限する: LIMIT

```js
// 最新の2件だけ取得
const latestTodos = sql.all`SELECT * FROM todos ORDER BY id DESC LIMIT 2`;
```

## データの更新: UPDATE

既存のデータを更新してみましょう。`update.js` を作成します。

```js
import { DatabaseSync } from "node:sqlite";

using db = new DatabaseSync("todo.db");
const sql = db.createTagStore();

// ID=1のToDoを完了にする
const result = sql.run`UPDATE todos SET completed = ${1} WHERE id = ${1}`;

console.log("更新結果:", result);
// { changes: 1, lastInsertRowid: 1 }

// 確認
const todo = sql.get`SELECT * FROM todos WHERE id = ${1}`;
console.log("更新後:", todo);

// スコープを抜けると自動的にdb.close()が呼ばれる
```

実行します。

```sh
node update.js
```

### UPDATE の構文

```sql
UPDATE テーブル名 SET カラム1 = 値1, カラム2 = 値2 WHERE 条件;
```

**重要**: `WHERE` を忘れると **全てのデータが更新** されてしまいます。

```sql
-- 危険！全てのToDoが完了になる
UPDATE todos SET completed = 1;

-- 正しい: ID=1のToDoだけ更新
UPDATE todos SET completed = 1 WHERE id = 1;
```

### 複数のカラムを更新

```js
sql.run`UPDATE todos SET title = ${"牛乳とパンを買う"}, completed = ${0} WHERE id = ${1}`;
```

## データの削除: DELETE

データを削除してみましょう。`delete.js` を作成します。

```js
import { DatabaseSync } from "node:sqlite";

using db = new DatabaseSync("todo.db");
const sql = db.createTagStore();

// 削除前の確認
console.log("削除前:", sql.all`SELECT * FROM todos`);

// ID=1のToDoを削除
const result = sql.run`DELETE FROM todos WHERE id = ${1}`;

console.log("削除結果:", result);
// { changes: 1, lastInsertRowid: 1 }

// 削除後の確認
console.log("削除後:", sql.all`SELECT * FROM todos`);
```

実行します。

```sh
node delete.js
```

### DELETE の構文

```sql
DELETE FROM テーブル名 WHERE 条件;
```

**重要**: `WHERE` を忘れると **全てのデータが削除** されてしまいます。

```sql
-- 危険！全てのToDoが消える
DELETE FROM todos;

-- 正しい: ID=1のToDoだけ削除
DELETE FROM todos WHERE id = 1;
```

## 練習問題

データベースをリセットして、以下の操作を順番に試してみましょう。

```sh
rm todo.db
node create-table.js
```

1. **INSERT**: 5つのToDoを追加してください
2. **SELECT**: 全てのToDoを取得して表示してください
3. **SELECT + WHERE**: ID が 3 のToDoを取得してください
4. **UPDATE**: ID が 2 のToDoを完了状態にしてください
5. **SELECT + WHERE**: 完了したToDoだけを取得してください
6. **DELETE**: ID が 1 のToDoを削除してください
7. **SELECT**: 最終的なToDoの一覧を表示してください

## ポイント

- **CRUD**: Create（INSERT）、Read（SELECT）、Update（UPDATE）、Delete（DELETE）
- **using 構文**: リソースを自動的に解放する構文。スコープを抜けると自動的に `db.close()` が呼ばれる
- **`db.createTagStore()`**: タグ付きテンプレートでSQLを実行できるストアを作成
- **CREATE TABLE**: テーブルを作成する（`db.exec()` を使用）
- **INSERT**: データを追加する（`sql.run` を使用）
- **SELECT**: データを取得する（`sql.get` で1件、`sql.all` で複数件、`WHERE` で条件指定、`ORDER BY` で並び替え）
- **UPDATE**: データを更新する（`sql.run` を使用、**WHERE を忘れずに**）
- **DELETE**: データを削除する（`sql.run` を使用、**WHERE を忘れずに**）
- **タグ付きテンプレート `${}`**: SQLインジェクション対策として必ず使う

## 参考文献

- [SQLite SQL Syntax](https://www.sqlite.org/lang.html)
- [SQLチュートリアル - W3Schools](https://www.w3schools.com/sql/)
