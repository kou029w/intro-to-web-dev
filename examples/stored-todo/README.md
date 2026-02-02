# stored-todo

> [!NOTE]
> Node.js v24.9.0 以降のバージョンで利用可能です。/ This example requires Node.js v24.9.0 or later.

![ToDo Example](./todo-example.webp)

## 概要

サーバー側でデータを永続化できるシンプルなToDoリストアプリです。タスクの追加、完了/未完了の切り替え、削除ができます。データはサーバー側のSQLiteデータベースに保存されるため、ページをリロードしても内容が保持されます。

## 機能

- [x] タスクの追加
- [x] タスクの一覧表示
- [x] タスクの完了/未完了切り替え
- [x] タスクの削除
- [x] データの永続化 (SQLite)

### 今後の拡張候補 (Could/Should)

- [ ] タスクの編集機能
- [ ] 期限の設定
- [ ] カテゴリ分け
- [ ] 検索・フィルター機能

## 画面構成

- **タスク一覧画面**: すべてのタスクを表示。新規追加フォーム、完了チェックボックス、削除ボタンを含む

## データ構造

```typescript
interface Task {
  id: string; // 一意のID
  title: string; // タスク名
  completed: boolean; // 完了状態
}
```

## APIエンドポイント

| メソッド | エンドポイント | 機能                 |
| -------- | -------------- | -------------------- |
| GET      | /api/tasks     | すべてのタスクを取得 |
| POST     | /api/tasks     | 新しいタスクを作成   |
| PUT      | /api/tasks/:id | 特定のタスクを更新   |
| DELETE   | /api/tasks/:id | 特定のタスクを削除   |

## 技術選定

- **フレームワーク**: Hono (サーバー) + React (クライアント)
- **スタイリング**: Tailwind CSS
- **データ保存**: SQLite
- **ビルドツール**: Vite

## セットアップと実行

### 開発サーバー起動

```bash
pnpm i
pnpm dev
```

ブラウザで <http://localhost:5173> を開く

### 本番ビルド

```bash
pnpm i
pnpm build
pnpm start
```

ブラウザで <http://localhost:3000> を開く
