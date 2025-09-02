---
created: 2025-09-03 12:30:00+09:00
---

# プロジェクトセットアップ

HonoXの基本概念を理解したところで、実際にプロジェクトをセットアップしてみましょう。「新しいフレームワークのセットアップって複雑じゃないの？」と心配する方もいるかもしれませんが、HonoXは非常にシンプルに始められます。

## 前提条件の確認

### 必要な環境

```bash
# Node.jsのバージョン確認（18以上推奨）
node --version
# v18.0.0 以上

# npmのバージョン確認
npm --version
# 8.0.0 以上推奨

# 任意：パッケージマネージャー
pnpm --version  # または
bun --version   # または
yarn --version
```

### 開発ツールの準備

推奨するエディター設定：
- **VS Code** + TypeScript拡張
- **Cursor** (AI搭載エディター)
- **WebStorm** (JetBrains製IDE)

## プロジェクトの初期化

### 1. HonoXプロジェクトの作成

```bash
# npm使用
npm create honox my-honox-app

# pnpm使用
pnpm create honox my-honox-app

# bun使用
bun create honox my-honox-app

# プロジェクトディレクトリに移動
cd my-honox-app
```

「`create honox`コマンドが最も簡単な開始方法です。必要なファイルとディレクトリが自動生成されます。」

### 2. 手動セットアップ（詳細理解用）

より理解を深めるため、手動でセットアップしてみましょう：

```bash
# 空のプロジェクトディレクトリを作成
mkdir my-honox-app
cd my-honox-app

# package.jsonを初期化
npm init -y
```

### 3. 依存関係のインストール

```bash
# HonoXと関連パッケージ
npm install honox hono

# 開発依存関係
npm install -D @types/node typescript vite

# UI関連（Reactを使用する場合）
npm install react react-dom
npm install -D @types/react @types/react-dom

# ビルドツール
npm install -D @vitejs/plugin-react
```

## プロジェクト構成の作成

### 基本的なディレクトリ構造

```bash
# ディレクトリの作成
mkdir -p app/routes app/islands app/components
mkdir -p public static

# 基本ファイルの作成
touch app/server.ts
touch vite.config.ts
touch tsconfig.json
```

### package.jsonの設定

```json
{
  "name": "my-honox-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3000",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "honox": "^0.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

### TypeScript設定

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"],
      "@/components/*": ["./app/components/*"],
      "@/islands/*": ["./app/islands/*"]
    }
  },
  "include": [
    "app/**/*",
    "vite.config.ts"
  ]
}
```

### Vite設定

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import honox from 'honox/vite'

export default defineConfig({
  plugins: [honox()],
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': '/app'
    }
  }
})
```

## 基本ファイルの作成

### サーバーエントリーポイント

`app/server.ts`:
```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'

const app = new Hono()

// ミドルウェアの設定
app.use('*', logger())

// 静的ファイルの配信
app.use('/static/*', serveStatic({ root: './' }))
app.use('/favicon.ico', serveStatic({ path: './public/favicon.ico' }))

export default app
```

### レンダラー設定

`app/routes/_renderer.tsx`:
```typescript
import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, title, description }) => {
  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'My HonoX App'}</title>
        <meta name="description" content={description || 'HonoXで作成したアプリケーション'} />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
})
```

### ホームページの作成

`app/routes/index.tsx`:
```typescript
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to HonoX!</h1>
      <p>高速でモダンなフルスタックフレームワーク</p>
      <nav>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
      </nav>
    </div>
  )
}
```

### Aboutページ

`app/routes/about.tsx`:
```typescript
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>このサイトはHonoXで構築されています。</p>
      <a href="/">ホームに戻る</a>
    </div>
  )
}
```

## スタイリングの設定

### CSS Modulesの設定

`app/styles/globals.css`:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

h1, h2, h3 {
  margin-bottom: 1rem;
}

p {
  margin-bottom: 1rem;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
```

### Tailwind CSSの導入（オプション）

```bash
# Tailwind CSS のインストール
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 環境変数の設定

### 開発環境設定

`.env`:
```bash
# アプリケーション設定
NODE_ENV=development
PORT=3000

# データベース設定（後で使用）
DATABASE_URL=sqlite://./dev.db

# API設定
API_BASE_URL=http://localhost:3000
```

`.env.example`:
```bash
# 環境変数のテンプレート
NODE_ENV=development
PORT=3000
DATABASE_URL=your_database_url
API_BASE_URL=your_api_base_url
```

### 環境変数の型定義

`app/types/env.d.ts`:
```typescript
declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test'
        PORT: string
        DATABASE_URL: string
        API_BASE_URL: string
      }
    }
  }
}
```

## 開発サーバーの起動

### 基本的な起動

```bash
# 開発サーバーの起動
npm run dev

# またはポート指定
npm run dev -- --port 3001
```

### ホットリロードの確認

ファイルを編集して保存すると、自動的にブラウザが更新されることを確認しましょう：

```typescript
// app/routes/index.tsx を編集
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to HonoX! 🎉</h1> {/* 絵文字を追加 */}
      <p>高速でモダンなフルスタックフレームワーク</p>
    </div>
  )
}
```

## デバッグ設定

### VS Code設定

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch HonoX",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/vite",
      "args": ["--mode", "development"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

`.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## 品質管理ツールの設定

### ESLintとPrettierの導入

```bash
# ESLint関連
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Prettier関連  
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

`.eslintrc.js`:
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    '@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error'
  }
}
```

`.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### package.jsonスクリプトの更新

```json
{
  "scripts": {
    "dev": "vite --port 3000",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint app --ext .ts,.tsx",
    "lint:fix": "eslint app --ext .ts,.tsx --fix",
    "format": "prettier --write \"app/**/*.{ts,tsx}\"",
    "check": "npm run type-check && npm run lint"
  }
}
```

## 初回ビルドテスト

### ビルドの実行

```bash
# 本番ビルドの実行
npm run build

# ビルド結果の確認
npm run preview
```

### ビルド結果の構造

```
dist/
├── _worker.js          # Cloudflare Workers用
├── static/             # 静的アセット
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
│   └── favicon.ico
└── server/             # サーバーサイドコード
    └── index.js
```

## よくある問題と解決方法

### 1. ポートが使用中エラー

```bash
# エラー: Port 3000 is already in use
# 解決方法：
lsof -ti:3000 | xargs kill -9
# または別のポートを使用
npm run dev -- --port 3001
```

### 2. TypeScriptエラー

```typescript
// エラー: Cannot find module 'honox/vite'
// 解決方法：node_modules を再インストール
rm -rf node_modules package-lock.json
npm install
```

### 3. HMR（Hot Module Replacement）が動作しない

```typescript
// vite.config.ts の server 設定を確認
export default defineConfig({
  plugins: [honox()],
  server: {
    hmr: {
      port: 3001, // 異なるポートを指定
    },
  },
})
```

## 追加設定（オプション）

### GitHub Actions設定

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Type check
        run: npm run type-check
        
      - name: Lint
        run: npm run lint
        
      - name: Build
        run: npm run build
```

### Docker設定

`Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

## やってみよう！

セットアップが完了したら、以下を試してみましょう：

1. **新しいページの追加**
   - `/contact` ページを作成
   - ナビゲーションにリンクを追加

2. **スタイルの適用**
   - CSS Modulesまたは Tailwind CSS を使用
   - レスポンシブデザインの実装

3. **環境変数の活用**
   - APIエンドポイントの設定
   - 開発・本番環境の切り替え

## ポイント

- **シンプルな開始**：`create honox` コマンドで即座にセットアップ完了
- **Viteベース**：高速なホットリロードと効率的なビルド
- **TypeScript対応**：型安全性を確保した開発環境
- **柔軟な設定**：プロジェクトに応じたカスタマイズが可能
- **品質管理**：ESLint、Prettierによるコード品質維持

## 参考文献

- [HonoX公式ドキュメント](https://github.com/honojs/honox)
- [Vite公式ガイド](https://vitejs.dev/guide/)
- [TypeScript設定リファレンス](https://www.typescriptlang.org/tsconfig)
- [React + TypeScriptベストプラクティス](https://react-typescript-cheatsheet.netlify.app/)
