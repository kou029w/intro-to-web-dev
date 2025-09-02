# TypeScript導入

この章では、JavaScriptに型の安全性を追加してくれる「TypeScript」について一緒に学んでいきましょう。TypeScriptは最初は少し複雑に感じるかもしれませんが、慣れてくるとバグが格段に減って、より安心してコードが書けるようになりますよ。

## 学習目標

- TypeScriptの基本的な考え方と型システムを理解する
- JavaScriptプロジェクトにTypeScriptを導入する方法を学ぶ
- 型を使ってバグを予防する方法を覚える
- 最新のTypeScript開発環境を構築する

## TypeScriptって何？

### 基本的な概念

**TypeScript**は、Microsoftが開発したJavaScriptの「型付き版」です。普通のJavaScriptに「型」という概念を追加することで、コードをより安全に、そして書きやすくしてくれます。

### TypeScriptの魅力

- **早期エラー発見**: コードを書いている段階でバグを発見できる
- **開発体験の向上**: 自動補完やリファクタリング機能が充実
- **コードがドキュメントになる**: 型が仕様書の役割を果たす
- **大規模開発に強い**: チーム開発でも安心してコードが書ける
- **JavaScript互換**: 既存のJavaScriptコードをそのまま使える

### JavaScriptとの違い

| 項目       | JavaScript                 | TypeScript                 |
| ---------- | -------------------------- | -------------------------- |
| 型システム | 動的（実行時に決まる）     | 静的（事前に決める）       |
| エラー発見 | 実行してみないと分からない | **書いている時点で分かる** |
| 開発支援   | 基本的なもの               | **とても充実**             |
| 学習コスト | 低い                       | **少し高い**               |
| ビルド工程 | そのまま実行可能           | **コンパイルが必要**       |

最初は少し大変かもしれませんが、慣れてしまえばJavaScriptには戻れなくなるほど便利ですよ。

## TypeScriptの基本的な書き方

### 1. 基本的な型

**プリミティブ型**

```typescript
// 基本型
let message: string = "Hello TypeScript";
let count: number = 42;
let isActive: boolean = true;
let data: null = null;
let value: undefined = undefined;

// 型推論（推奨）
let name = "Alice"; // string 型として推論
let age = 30; // number 型として推論
let isStudent = false; // boolean 型として推論
```

**配列とオブジェクト**

```typescript
// 配列
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["Alice", "Bob", "Charlie"];

// オブジェクト
let person: {
  name: string;
  age: number;
  isStudent?: boolean; // オプショナルプロパティ
} = {
  name: "Alice",
  age: 30,
};

// より複雑なオブジェクト
let config: {
  apiUrl: string;
  timeout: number;
  features: {
    auth: boolean;
    cache: boolean;
  };
} = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  features: {
    auth: true,
    cache: false,
  },
};
```

### 2. インターフェースと型エイリアス

**インターフェース定義**

```typescript
// User インターフェース
interface User {
  readonly id: number; // 読み取り専用
  name: string;
  email: string;
  age?: number; // オプショナル
}

// インターフェースの使用
const createUser = (userData: User): User => {
  return {
    id: Date.now(),
    ...userData,
  };
};

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
};
```

**型エイリアス**

```typescript
// 基本的な型エイリアス
type UserId = number;
type UserRole = "admin" | "user" | "guest";

// 複雑な型
type APIResponse<T> = {
  data: T;
  status: "success" | "error";
  message?: string;
};

// 使用例
type UserResponse = APIResponse<User>;

const fetchUser = async (id: UserId): Promise<UserResponse> => {
  // API呼び出しロジック
  return {
    data: { id, name: "Alice", email: "alice@example.com" },
    status: "success",
  };
};
```

### 3. 関数の型定義

**関数シグネチャ**

```typescript
// 基本的な関数
function add(a: number, b: number): number {
  return a + b;
}

// アロー関数
const multiply = (a: number, b: number): number => a * b;

// オプション引数とデフォルト値
const greet = (name: string, title?: string, prefix = "Mr."): string => {
  return `Hello, ${title || prefix} ${name}`;
};

// 可変長引数
const sum = (...numbers: number[]): number => {
  return numbers.reduce((total, num) => total + num, 0);
};
```

**高階関数の型定義**

```typescript
// コールバック関数の型
type EventHandler<T> = (event: T) => void;
type Transformer<T, U> = (input: T) => U;

// 使用例
const handleClick: EventHandler<MouseEvent> = (event) => {
  console.log("Clicked at:", event.clientX, event.clientY);
};

const doubleNumbers: Transformer<number[], number[]> = (numbers) => {
  return numbers.map((n) => n * 2);
};
```

### 4. ジェネリクス

**基本的なジェネリクス**

```typescript
// ジェネリック関数
function identity<T>(arg: T): T {
  return arg;
}

// 使用例
const stringValue = identity("hello"); // string型
const numberValue = identity(42); // number型

// 複数の型パラメータ
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const nameAge = pair("Alice", 30); // [string, number]
```

**ジェネリクス制約**

```typescript
// インターフェース制約
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello"); // OK
logLength([1, 2, 3]); // OK
// logLength(42)          // Error: number に length プロパティはない
```

### 5. ユニオン型とインターセクション型

**ユニオン型（複数の型のうち一つ）**

```typescript
type Status = "loading" | "success" | "error";
type StringOrNumber = string | number;

// 判別可能なユニオン
interface LoadingState {
  status: "loading";
}
interface SuccessState {
  status: "success";
  data: any;
}
interface ErrorState {
  status: "error";
  error: string;
}

type AppState = LoadingState | SuccessState | ErrorState;

const handleState = (state: AppState) => {
  switch (state.status) {
    case "loading":
      console.log("Loading...");
      break;
    case "success":
      console.log("Data:", state.data);
      break;
    case "error":
      console.log("Error:", state.error);
      break;
  }
};
```

**インターセクション型（複数の型を結合）**

```typescript
type Person = { name: string } & { age: number };

const person: Person = { name: "Alice", age: 30 };
```

## プロジェクトへのTypeScript導入

### 1. 新規プロジェクトでのセットアップ

**Vite + React + TypeScript**

```bash
# プロジェクト作成
pnpm create vite my-ts-app --template react-ts
cd my-ts-app
pnpm install

# 開発サーバー起動
pnpm run dev
```

### 2. 既存JavaScriptプロジェクトの移行

```bash
# TypeScriptの追加
pnpm add -D typescript @types/node

# tsconfig.json作成
npx tsc --init
```

**移行の流れ**

1. `.js` → `.ts` ファイル名変更
2. 型注釈を段階的に追加

```typescript
// Before (JavaScript)
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// After (TypeScript)
interface Item {
  price: number;
  name: string;
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### 3. tsconfig.json の設定

**React プロジェクト向け設定**

```bash
# 推奨ベース設定のインストール
pnpm add -D @tsconfig/vite-react
```

```json
{
  "extends": "@tsconfig/vite-react/tsconfig.json",
  "compilerOptions": {
    // パスエイリアス設定
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

> **Note** > `@tsconfig/vite-react` は Vite + React に最適化された設定を提供します。必要に応じて `compilerOptions` で上書き可能です。

## React + TypeScript実践

### 1. コンポーネントの型定義

**基本的なコンポーネント**

```tsx
import { ReactNode } from "react";

// Props インターフェース
interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// コンポーネント定義
export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  onClick,
}: ButtonProps) => {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// 使用例
const App = () => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Clicked!", event.currentTarget);
  };

  return (
    <Button variant="primary" onClick={handleClick}>
      Click me
    </Button>
  );
};
```

**フォームコンポーネント**

```tsx
import { useState, FormEvent, ChangeEvent } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};
```

### 2. カスタムHooksの型定義

**useLocalStorage Hook**

```typescript
import { useState } from "react";

type SetValue<T> = T | ((val: T) => T);

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: SetValue<T>) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}

// 使用例
const UserSettings = () => {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Toggle theme: {theme}
    </button>
  );
};
```

**useApi Hook**

```typescript
import { useState, useEffect } from "react";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useApi<T>(url: string): UseApiResult<T> {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({ data: null, loading: true, error: null });

  const fetchData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: T = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { ...state, refetch: fetchData };
}
```

## 型定義ファイルの管理

### プロジェクト構造

```
src/
├── types/
│   ├── index.ts    # 再エクスポート
│   ├── user.ts     # ユーザー型
│   └── api.ts      # API型
├── components/
└── hooks/
```

**型定義の例**

```typescript
// src/types/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}
```

```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
}
```

```typescript
// src/types/index.ts
export * from "./user";
export * from "./api";
```

### 型ガードと型の絞り込み

**型ガード関数**

```typescript
export function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value
  );
}

// 使用例
const processUserData = (data: unknown) => {
  if (isUser(data)) {
    console.log(`User: ${data.name}`);
  }
};
```

## 高度なTypeScript機能

### ユーティリティ型

**よく使う組み込み型**

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Partial - すべてオプショナル
type PartialUser = Partial<User>;

// Pick - 特定のプロパティのみ
type PublicUser = Pick<User, "id" | "name" | "email">;

// Omit - 特定のプロパティを除外
type UserWithoutPassword = Omit<User, "password">;

// Required - すべて必須
type RequiredUser = Required<Partial<User>>;
```

**条件型とマップ型**

```typescript
// 条件型
type NonNullable<T> = T extends null | undefined ? never : T;

// マップ型
type ReadOnly<T> = {
  readonly [K in keyof T]: T[K];
};

type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};
```

## トラブルシューティング

### よくある問題と解決法

1. **any型の乱用**

   ```typescript
   // ❌ 悪い例
   const fetchData = (): any => {
     // ...
   };

   // ✅ 良い例
   interface ApiResponse<T> {
     data: T;
     status: number;
   }

   const fetchData = <T,>(): Promise<ApiResponse<T>> => {
     // ...
   };
   ```

2. **null/undefined エラー**

   ```typescript
   // ❌ 危険
   const getUserName = (user: User | null) => {
     return user.name; // user が null の可能性
   };

   // ✅ 安全
   const getUserName = (user: User | null): string | null => {
     return user?.name ?? null;
   };
   ```

3. **型アサーションの過度な使用**

   ```typescript
   // ❌ 危険
   const data = response as User;

   // ✅ 安全
   const isUser = (data: unknown): data is User => {
     // 型ガード実装
   };

   if (isUser(data)) {
     // data は User 型として使用可能
   }
   ```

## まとめ

TypeScriptの利点：

- ✅ **型安全性**: コンパイル時のエラー検出でバグ予防
- ✅ **開発効率**: IntelliSense・リファクタリング支援
- ✅ **可読性**: 型情報がドキュメントとして機能
- ✅ **スケーラビリティ**: 大規模開発での保守性向上

導入のベストプラクティス：

1. 段階的な導入で学習コストを分散
2. strict モードで厳密な型チェック
3. 適切な型定義ファイル管理
4. ユーティリティ型の活用でDRY原則
