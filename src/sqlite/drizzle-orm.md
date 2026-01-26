# Drizzle ORMの紹介

ここまでSQLを直接書いてデータベースを操作してきました。シンプルなアプリケーションならこれで十分ですが、規模が大きくなると課題が出てきます。

## SQL直接操作の課題

### 問題1: データベースごとにコードが変わる

SQLiteで書いたコードは、PostgreSQLやMySQLにそのまま使えるわけではありません。

```js
// SQLite
sql.get`SELECT * FROM todos WHERE id = ${1}`;

// 別のライブラリ、別の書き方
client.query("SELECT * FROM todos WHERE id = $1", [1]);
```

データベースを変更するたびに、コードを大幅に書き直す必要があります。

### 問題2: 型安全性がない

TypeScriptを使っていても、SQLの結果は `any` 型になりがちです。

```ts
const todo = sql.get`SELECT * FROM todos WHERE id = ${1}`; // any型
console.log(todo.titl); // typo!（でもエラーにならない）
```

### 問題3: 変換のためのコードが増える

複雑なクエリになるとオブジェクトに変換するコードが増えます。

```ts
const rows = sql.all`
  SELECT id, title, completed, created_at
    FROM todos
    WHERE completed = ${false}
    ORDER BY created_at DESC
`;

const todos: Todo[] = rows.map((row) => ({
  id: row.id,
  title: row.title,
  completed: Boolean(row.completed),
  createdAt: new Date(row.created_at),
}));
```

## ORMという解決策

**ORM**（Object-Relational Mapping）は、これらの問題を解決するライブラリです。

- データベースの違いを吸収
- 型安全なクエリの作成
- オブジェクト指向的なデータ操作

## Drizzle ORMとは

**Drizzle ORM** は、TypeScriptファーストで設計された軽量なORMです。

### 特徴

1. **型安全**: スキーマからTypeScriptの型が自動生成される
2. **軽量**: バンドルサイズが小さく、パフォーマンスが良い
3. **SQLライク**: SQLに近い書き方ができる（学習コストが低い）
4. **複数DB対応**: SQLite、PostgreSQL、MySQLに対応

## Drizzleでの書き方を見てみよう

先ほどのToDoアプリをDrizzle ORMで書くと、どうなるか見てみましょう。

### スキーマ定義

```ts
// schema.ts
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false),
});
```

### CRUD操作

```ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import Database from "better-sqlite3";
import { todos } from "./schema";

const sqlite = new Database("todo.db");
const db = drizzle(sqlite);

// 一覧取得（SELECT）
const allTodos = db.select().from(todos).all();

// 1件取得
const todo = db.select().from(todos).where(eq(todos.id, 1)).get();

// 作成（INSERT）
const newTodo = db
  .insert(todos)
  .values({ title: "牛乳を買う" })
  .returning()
  .get();

// 更新（UPDATE）
db.update(todos).set({ completed: true }).where(eq(todos.id, 1)).run();

// 削除（DELETE）
db.delete(todos).where(eq(todos.id, 1)).run();
```

### 比較

| 操作         | 生のSQL                                | Drizzle ORM                                 |
| ------------ | -------------------------------------- | ------------------------------------------- |
| 一覧取得     | `SELECT * FROM todos`                  | `db.select().from(todos)`                   |
| 条件付き取得 | `WHERE id = ?`                         | `.where(eq(todos.id, 1))`                   |
| 作成         | `INSERT INTO todos (title) VALUES (?)` | `db.insert(todos).values({ title: "..." })` |
| 更新         | `UPDATE todos SET completed = ?`       | `db.update(todos).set({ completed: true })` |
| 削除         | `DELETE FROM todos WHERE id = ?`       | `db.delete(todos).where(eq(todos.id, 1))`   |

SQLに近い書き方なので、これまで学んだ知識がそのまま活かせます。

## Drizzleを使うメリット

### 1. 型安全

```ts
// スキーマから型が自動生成される
type Todo = typeof todos.$inferSelect;
// { id: number; title: string; completed: boolean; }

const todo = db.select().from(todos).where(eq(todos.id, 1)).get();
// todo の型は Todo | undefined

console.log(todo?.titl); // コンパイルエラー！typoを検出
```

### 2. 自動補完が効く

VSCodeなどのエディタで、カラム名やメソッドの自動補完が効きます。開発効率が上がります。

### 3. データベースの切り替えが容易

```ts
// SQLiteの場合
import { drizzle } from "drizzle-orm/better-sqlite3";

// PostgreSQLに変更する場合
import { drizzle } from "drizzle-orm/node-postgres";

// スキーマ定義も少し変わるが、クエリのコードはほぼそのまま使える
```

## いつORMを使うべきか

### 生のSQLが向いているケース

- 学習目的（SQLを理解したい）
- 小規模なプロジェクト
- パフォーマンスが極めて重要な処理

### ORMが向いているケース

- チーム開発
- 中〜大規模なプロジェクト
- 型安全性を重視する場合
- データベースを変更する可能性がある

## Drizzleの導入方法（参考）

実際にDrizzleを導入する場合の手順を簡単に紹介します。

```bash
# Drizzle ORMのインストール
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3
```

詳しいセットアップ方法は公式ドキュメントを参照してください。

## ポイント

- **ORM**: オブジェクトとリレーショナルデータベースをマッピングするライブラリ
- **Drizzle ORM**: TypeScriptファーストで型安全、SQLに近い書き方ができるORM
- **型安全**: スキーマから型が自動生成され、タイポや型エラーをコンパイル時に検出
- **SQLの知識は無駄にならない**: ORMを使う場合でも、SQLの理解は重要
- **選択**: プロジェクトの規模や要件に応じて、生のSQLとORMを使い分ける

## 参考文献

- [Drizzle ORM 公式ドキュメント](https://orm.drizzle.team/)
- [Drizzle ORM - SQLite](https://orm.drizzle.team/docs/get-started-sqlite)
