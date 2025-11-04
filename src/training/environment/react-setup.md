# React環境構築

この章では、現代のWebアプリ開発に欠かせない「React」の環境構築について一緒に学んでいきましょう。Reactは最初は少し難しく感じるかもしれませんが、コンポーネントという考え方に慣れてしまえば、とても効率的にWebアプリが作れるようになりますよ。

## 学習目標

- Reactの基本的な考え方とコンポーネントについて理解する
- Viteを使った最新のReact開発環境を作る
- シンプルなTodoアプリを作りながらReactに慣れる
- ビルドとデプロイの基本を覚える

## Reactって何？

### 基本的な概念

**React** は、Meta（旧Facebook）が開発したユーザーインターフェース（UI）を作るためのJavaScriptライブラリです。「部品（コンポーネント）を組み合わせてWebページを作る」という考え方が特徴です。

### Reactの魅力

- **コンポーネントベース**: UIを再利用できる部品として作成
- **宣言的なUI**: 「どう表示するか」ではなく「何を表示するか」を記述
- **仮想DOM**: 画面更新が高速で効率的
- **単方向データフロー**: データの流れが分かりやすい

### Reactの基本的な概念

Reactには押さえておくべき重要な概念がいくつかあります。ここでは最低限必要なものだけ紹介します。

> **Note**: より詳しい内容は[React公式ドキュメント（日本語）](https://ja.react.dev/learn)で学べます。

#### 1. コンポーネント

コンポーネントは、UIの一部分を担当する再利用可能な部品です。

```jsx
// 関数コンポーネント（現在の主流）
const Welcome = ({ name }) => {
  return <h1>こんにちは、{name}さん！</h1>;
};
```

「コンポーネント」という名前が難しそうに聞こえるかもしれませんが、入力（Props）を受け取り、出力として見た目（JSX）を返すただのJavaScriptの関数です。
Reactではこれを `<Welcome name="太郎" />` のように使うことができ、画面上に「こんにちは、太郎さん！」と表示されます。

#### 2. Props（プロップス）

親コンポーネントから子コンポーネントへデータを渡す仕組みです。

```jsx
// Props - 親から子への値の渡し方
function Button({ text, onClick }) {
  return <button onClick={onClick}>{text}</button>;
}
```

ただの関数の引数です。JavaScriptの関数なので文字列だけでなく数値や関数、オブジェクトなどあらゆるものを渡すことができます。

#### 3. State（状態）

コンポーネントが持つ内部データです。`useState`を使って管理します。

```jsx
// State - コンポーネントの内部状態
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

## Viteによるプロジェクト作成

### 1. Viteとは

**Vite**（ヴィート）は、高速で軽量なビルドツール・開発サーバーです。

**特徴:**

- ⚡ **高速**: ES modules とネイティブESMを活用
- 🔥 **HMR**: Hot Module Replacement
- 📦 **最適化**: Rollup ベースのプロダクションビルド
- 🔧 **設定不要**: ゼロコンフィグで開始可能

### 2. プロジェクト作成

```bash
# Viteでプロジェクト作成
pnpm create vite my-react-app --template react-ts

# プロジェクトに移動
cd my-react-app

# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm run dev
```

### 3. プロジェクト構造

```
my-react-app/
├── public/           # 静的ファイル
│   └── vite.svg
├── src/             # ソースコード
│   ├── assets/      # アセット（画像、CSS等）
│   ├── components/  # コンポーネント
│   ├── hooks/       # カスタムフック
│   ├── types/       # TypeScript型定義
│   ├── App.tsx      # メインアプリコンポーネント
│   ├── main.tsx     # エントリーポイント
│   └── index.css    # グローバルCSS
├── index.html       # HTMLテンプレート
├── package.json     # 依存関係・スクリプト
├── tsconfig.json    # TypeScript設定
└── vite.config.ts   # Vite設定
```

## TypeScript設定

Viteで作成されたプロジェクトには、既に最適な設定が含まれています。パスエイリアスを使いたい場合は以下を追加します。

```json
// tsconfig.json
{
  "extends": "@tsconfig/vite-react/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

```bash
# ベース設定のインストール
pnpm add -D @tsconfig/vite-react
```

> **Note**
> Viteはtsconfig.jsonの`paths`設定を自動的に認識するため、vite.config.tsでの追加設定は不要です。

## 基本的なReactアプリケーション構築

### シンプルなTodoアプリ

**型定義**

```typescript
// src/types/todo.ts
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}
```

**メインアプリケーション**

```tsx
// src/App.tsx
import { useState } from "react";
import type { Todo } from "@/types/todo";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  return (
    <div className="app">
      <h1>Todo App</h1>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

> **Note**
> 実際のアプリでは、コンポーネントを分割して再利用性を高めます。上記は学習用の最小構成です。

## React Hooks の基本

Reactには「Hooks」という機能があります。最もよく使う2つを紹介します。

### useState - 状態管理

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

### useEffect - 副作用処理

```tsx
import { useState, useEffect } from "react";

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then(setUser);
  }, [userId]); // userIdが変わったら再実行

  return <div>{user?.name}</div>;
}
```

> **Note**
> より詳しくは[React公式ドキュメント](https://ja.react.dev/reference/react/hooks)を参照してください。

## ビルドとデプロイ

### プロダクションビルド

```bash
pnpm run build      # ビルド実行
pnpm run preview    # ビルド結果の確認
```

### 環境変数

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3001/api
```

```tsx
// 使用例
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

### Vercel デプロイ (任意)

```bash
npm i -g vercel
vercel --prod
```

> **Note**
> VercelはViteプロジェクトを自動検出するため、設定ファイルは通常不要です。

## トラブルシューティング

**ホットリロードが効かない**

```bash
# 開発サーバーを再起動
Ctrl+C
pnpm run dev
```

**ビルドエラー**

```bash
# 依存関係を再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**参考リンク**

- [React公式ドキュメント](https://ja.react.dev/)
- [Vite公式ドキュメント](https://ja.vitejs.dev/)

## まとめ

この章では、React環境構築の基本を学びました。

### ポイント

- **Vite**: 高速な開発サーバーとビルドツール
- **コンポーネント**: UIを部品として作る考え方
- **Props**: 親から子へデータを渡す仕組み
- **State**: コンポーネントが持つ内部データ
- **Hooks**: `useState`と`useEffect`が基本

Reactは最初は難しく感じるかもしれませんが、コンポーネントを作りながら慣れていくことが一番の近道です。まずは小さなアプリから始めて、少しずつ機能を追加していきましょう！
