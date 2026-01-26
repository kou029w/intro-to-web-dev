# Node.jsでSQLiteを使う

Node.js v22.5.0から、SQLiteを扱うための新しいAPIが追加されました。外部ライブラリをインストールせずに、Node.jsだけでSQLiteデータベースを操作できます。

## 2つの新機能

Node.jsには、SQLite関連の機能が2つ追加されています。

### 1. `node:sqlite` モジュール

Node.js v22.5.0で追加された、SQLiteデータベースを操作するためのモジュールです。

```js
import { DatabaseSync } from "node:sqlite";

using db = new DatabaseSync("mydata.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT
  )
`);
```

> **Note**\
> `using` とは?
>
> このコードには `using` というキーワードがあります。これは **Explicit Resource Management** という新しい構文で、変数がスコープを抜けるときに自動的にリソースを解放してくれます。ここではサーバーが停止するときに、自動的に `db.close()` が呼ばれます。

### 2. `--experimental-webstorage` フラグ

実験的な機能として、**localStorage API** をNode.jsで使えるようにするフラグです。ブラウザの `localStorage` と同じAPIで、データを永続化できます (Node.js v24.9.0以降で利用可能)。

```bash
node --experimental-webstorage --localstorage-file=localstorage.db main.js
```

```js
// ブラウザと同じAPIが使える!
localStorage.setItem("username", "田中太郎");
console.log(localStorage.getItem("username")); // "田中太郎"
```

このハンズオンでは、より柔軟で実践的な **`node:sqlite` モジュール** を使ってSQLiteを学びます。

## `node:sqlite` モジュールを試してみよう

早速、`node:sqlite` を使ってみましょう。

### 準備

新しいディレクトリを作成して、プロジェクトを初期化します。

```bash
mkdir node-sqlite
cd node-sqlite
pnpm init --init-type=module
```

### 最初のコード

`main.js` を作成して、以下のコードを書いてみましょう。

```js
import { DatabaseSync } from "node:sqlite";

// データベースに接続 (ファイルがなければ自動で作成される)
using db = new DatabaseSync("test.db");

console.log("データベースに接続しました！");

// スコープを抜けると自動的にdb.close()が呼ばれる
```

実行してみましょう。

```bash
node main.js
```

```
データベースに接続しました！
```

カレントディレクトリに `test.db` というファイルが作成されているはずです。これがSQLiteのデータベースファイルです。

```bash
ls -la
```

```
-rw-r--r--  1 user  staff  8192  1月 20 10:00 test.db
```

## DatabaseSyncクラスの基本

`node:sqlite` の中心となるのが `DatabaseSync` クラスです。基本的な使い方を見ていきましょう。

### データベースへの接続と `using` 構文

```js
import { DatabaseSync } from "node:sqlite";

// ファイルベースのデータベース
using db = new DatabaseSync("mydata.db");

// メモリ上のデータベース (一時的なデータベース)
using memoryDb = new DatabaseSync(":memory:");
```

ここで `using` という見慣れないキーワードが登場しました。これは **Explicit Resource Management** と呼ばれる新しい構文です (JavaScript ES2026で追加予定)。

`using` を使うと、変数がスコープを抜けるときに **自動的にリソースを解放**してくれます。つまり、`db.close()` を明示的に呼ぶ必要がなくなります。

```js
// 従来の書き方
const db = new DatabaseSync("mydata.db");
try {
  // データベース操作
} finally {
  db.close(); // 忘れずに閉じる必要がある
}

// using を使った書き方
using db = new DatabaseSync("mydata.db");
// データベース操作
// スコープを抜けると自動でdb.close()が呼ばれる
```

これにより、コードがシンプルになり、閉じ忘れのリスクもなくなります (便利ですね)。

### exec() - 基本的なSQLを実行する

テーブルの作成など、結果を返さないSQLを実行するときに使います。

```js
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT
  )
`);
```

### createTagStore() - タグ付きテンプレートでSQLを実行する

`createTagStore()` を使うと、**タグ付きテンプレート**でSQLを実行できます。より読みやすく、安全なコードになります。

```js
// タグストアを作成
const sql = db.createTagStore();

// データを挿入
sql.run`INSERT INTO users (name, email) VALUES (${"田中太郎"}, ${"tanaka@example.com"})`;

// 1件取得
const user = sql.get`SELECT * FROM users WHERE id = ${1}`;
console.log(user); // { id: 1, name: '田中太郎', email: 'tanaka@example.com' }

// 全件取得
const users = sql.all`SELECT * FROM users`;
console.log(users); // [{ id: 1, ... }, { id: 2, ... }]
```

`${}` の中に値を埋め込むと、自動的に **SQLインジェクション対策**がされます。安全で読みやすい書き方ですね

## 実践: ユーザーの登録と取得

学んだことを使って、ユーザーを登録・取得するプログラムを書いてみましょう。

`main.js` を以下のように書き換えます。

```js
import { DatabaseSync } from "node:sqlite";

// データベースに接続 (using構文で自動的にcloseされる)
using db = new DatabaseSync("users.db");
const sql = db.createTagStore();

// テーブルを作成 (存在しなければ)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log("テーブルを作成しました");

// ユーザーを追加
const result1 = sql.run`INSERT INTO users (name, email) VALUES (${"田中太郎"}, ${"tanaka@example.com"})`;
console.log("追加しました:", result1);

const result2 = sql.run`INSERT INTO users (name, email) VALUES (${"山田花子"}, ${"yamada@example.com"})`;
console.log("追加しました:", result2);

// 全ユーザーを取得
const users = sql.all`SELECT * FROM users`;

console.log("\n登録されているユーザー:");
for (const user of users) {
  console.log(`  ${user.id}: ${user.name} (${user.email})`);
}

// スコープを抜けると自動的にdb.close()が呼ばれる
```

実行してみましょう。

```bash
node main.js
```

```
テーブルを作成しました
追加しました: { changes: 1, lastInsertRowid: 1 }
追加しました: { changes: 1, lastInsertRowid: 2 }

登録されているユーザー:
  1: 田中太郎 (tanaka@example.com)
  2: 山田花子 (yamada@example.com)
```

もう一度実行すると、さらにユーザーが追加されます (IDは3, 4になります)。これがデータの永続化です。

## run()の戻り値

`sql.run` は、実行結果の情報を返します。

```js
const result = sql.run`INSERT INTO users (name, email) VALUES (${"佐藤次郎"}, ${"sato@example.com"})`;
console.log(result);
// {
//   changes: 1,           // 影響を受けた行数
//   lastInsertRowid: 3    // 最後に挿入された行のID
// }
```

- **changes**: INSERT、UPDATE、DELETEで影響を受けた行数
- **lastInsertRowid**: INSERTで自動生成されたID

## エラーハンドリング

SQLにエラーがあると例外がスローされます。

```js
try {
  db.exec("CREATE TABLE invalid syntax");
} catch (error) {
  console.error("SQLエラー:", error.message);
}
```

## やってみよう

1. `main.js` を実行して、ユーザーが追加されることを確認しましょう
2. 何度か実行して、データが蓄積されることを確認しましょう
3. `users.db` を削除してから実行すると、どうなるか試してみましょう

## ポイント

- **`node:sqlite`**: Node.js (Deno/Bunでも使える) SQLite モジュール
- **`DatabaseSync`**: データベース接続を管理するクラス
- **`db.exec(sql)`**: 結果を返さないSQLを実行 (CREATE TABLEなど)
- **`db.createTagStore()`**: タグ付きテンプレートでSQLを実行できるストアを作成
  - **`sql.run`**: INSERT/UPDATE/DELETEを実行。自動的にSQLインジェクション対策される
  - **`sql.get`**: 1件取得
  - **`sql.all`**: 全件取得

## 参考文献

- [Node.js SQLite documentation](https://nodejs.org/api/sqlite.html)
