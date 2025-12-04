# デプロイ戦略

Honoアプリケーションの真価は、様々な環境にデプロイできる柔軟性にあります。Edge環境からクラウド、従来のサーバーまで、それぞれの特性に応じた最適なデプロイ戦略について学んでいきましょう。

## デプロイ先の選択肢

### Edge環境
- **Cloudflare Workers**：グローバルエッジネットワーク
- **Deno Deploy**：高速なV8ベースの実行環境
- **Vercel Edge Functions**：フロントエンドとの統合に最適
- **Netlify Edge Functions**：Jamstackアーキテクチャに適合

### クラウドプラットフォーム
- **AWS Lambda**：サーバーレス環境
- **Google Cloud Run**：コンテナベースのサーバーレス
- **Azure Container Instances**：軽量コンテナ実行
- **Railway**：シンプルなデプロイ体験

### 従来のホスティング
- **Node.js対応のVPS**
- **Docker環境**
- **Heroku**（廃止予定）

## Cloudflare Workersへのデプロイ

### 基本的なセットアップ

```bash
# Wranglerをインストール
npm install -g wrangler

# Cloudflareにログイン
wrangler login

# 新しいプロジェクトを作成
wrangler init my-hono-app
```

`wrangler.toml`の設定：
```toml
name = "my-hono-app"
main = "src/index.ts"
compatibility_date = "2023-12-01"

# 環境変数
[env.production.vars]
NODE_ENV = "production"

# KVストレージ（オプション）
[[env.production.kv_namespaces]]
binding = "MY_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"

# D1データベース（オプション）
[[env.production.d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Hono アプリケーションの調整：
```typescript
import { Hono } from 'hono'

// Cloudflare Workers用の型定義
interface Env {
  NODE_ENV: string
  MY_KV: KVNamespace
  DB: D1Database
}

const app = new Hono<{ Bindings: Env }>()

app.get('/', (c) => {
  return c.text('Hello from Cloudflare Workers!')
})

app.get('/api/data', async (c) => {
  // KVストレージの使用
  const cachedData = await c.env.MY_KV.get('my-key')

  if (cachedData) {
    return c.json(JSON.parse(cachedData))
  }

  // D1データベースの使用
  const result = await c.env.DB.prepare(
    'SELECT * FROM users LIMIT 10'
  ).all()

  // データをキャッシュ
  await c.env.MY_KV.put('my-key', JSON.stringify(result), {
    expirationTtl: 3600 // 1時間でキャッシュ無効
  })

  return c.json(result)
})

export default app
```

「Cloudflare Workersでは、従来のファイルシステムやNode.jsの一部APIが使えないことに注意が必要です。」

デプロイ実行：
```bash
# 開発環境でテスト
wrangler dev

# 本番環境にデプロイ
wrangler deploy

# 環境変数の設定
wrangler secret put JWT_SECRET
```

## Deno Deployへのデプロイ

### GitHubとの連携デプロイ

`deno.json`の設定：
```json
{
  "compilerOptions": {
    "allowJs": true,
    "lib": ["deno.window"],
    "strict": true
  },
  "tasks": {
    "dev": "deno run --allow-net --watch main.ts"
  }
}
```

Deno用のエントリーポイント：
```typescript
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import app from "./src/index.ts"

serve(app.fetch, { port: 8000 })
```

GitHubリポジトリにpush後、Deno Deployのダッシュボードで：
1. プロジェクトを作成
2. GitHubリポジトリを接続
3. エントリーポイント（main.ts）を指定
4. 環境変数を設定
5. 自動デプロイが開始される

## Vercelへのデプロイ

### Vercel用の設定

`vercel.json`：
```json
{
  "functions": {
    "api/*.ts": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    }
  ]
}
```

`api/index.ts`：
```typescript
import { Hono } from 'hono'
import { handle } from 'hono/vercel'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Vercel!',
    timestamp: new Date().toISOString()
  })
})

app.get('/users/:id', async (c) => {
  const id = c.req.param('id')
  // データベースからユーザー情報を取得...
  return c.json({ userId: id })
})

export default handle(app)
```

### 環境変数の設定

```bash
# Vercel CLIでの環境変数設定
npm install -g vercel
vercel login

# プロジェクトのリンク
vercel link

# 環境変数の追加
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production

# デプロイ実行
vercel deploy --prod
```

## AWS Lambdaへのデプロイ

### Serverless Frameworkを使用

```bash
npm install -g serverless
npm install serverless-plugin-typescript
```

`serverless.yml`：
```yaml
service: hono-lambda-app

provider:
  name: aws
  runtime: nodejs18.x
  stage: ${env:STAGE, 'dev'}
  region: ${env:AWS_REGION, 'us-east-1'}
  environment:
    NODE_ENV: ${env:NODE_ENV, 'development'}
    DATABASE_URL: ${env:DATABASE_URL}
    JWT_SECRET: ${env:JWT_SECRET}

plugins:
  - serverless-plugin-typescript

functions:
  api:
    handler: src/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

package:
  exclude:
    - node_modules/**
    - .env
    - README.md
```

Lambda用のハンドラー：
```typescript
import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import app from './index'

export const handler = handle(app)
```

デプロイ実行：
```bash
# 環境変数を設定してデプロイ
STAGE=production DATABASE_URL=xxx JWT_SECRET=yyy serverless deploy
```

## Google Cloud Runへのデプロイ

### Dockerfileの作成

```dockerfile
FROM node:18-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# アプリケーションファイルをコピー
COPY . .

# TypeScriptをビルド
RUN npm run build

# 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S hono -u 1001

# ファイルの所有者を変更
CHOWN -R hono:nodejs /app
USER hono

# ポートを公開
EXPOSE 8080

# アプリケーションを起動
CMD ["npm", "start"]
```

`package.json`のスクリプト調整：
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts"
  }
}
```

Cloud Runへのデプロイ：
```bash
# Google Cloud CLIで認証
gcloud auth login

# プロジェクトを設定
gcloud config set project YOUR_PROJECT_ID

# イメージをビルドしてContainer Registryにプッシュ
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/hono-app

# Cloud Runにデプロイ
gcloud run deploy hono-app \
  --image gcr.io/YOUR_PROJECT_ID/hono-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,DATABASE_URL=${DATABASE_URL}"
```

## CI/CDパイプラインの構築

### GitHub Actionsでの自動デプロイ

`.github/workflows/deploy.yml`：
```yaml
name: Deploy to Production

on:
  push:
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

      - name: Run tests
        run: npm run test

      - name: Run type check
        run: npm run type-check

      - name: Run lint
        run: npm run lint

  deploy-cloudflare:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: deploy --env production

  deploy-vercel:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 段階的デプロイメント

```yaml
name: Staged Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy-staging:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      # ... ステージング環境へのデプロイ

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      # ... 本番環境へのデプロイ

  smoke-test:
    needs: deploy-production
    runs-on: ubuntu-latest
    steps:
      - name: Run smoke tests
        run: |
          curl -f ${{ secrets.PRODUCTION_URL }}/health || exit 1
          curl -f ${{ secrets.PRODUCTION_URL }}/api/ping || exit 1
```

## パフォーマンス最適化

### コードスプリッティング

```typescript
// 動的インポートを使用して必要な時にロード
app.get('/admin/*', async (c) => {
  const { adminRoutes } = await import('./routes/admin')
  return adminRoutes.fetch(c.req, c.env)
})

app.get('/heavy-computation', async (c) => {
  // 重い処理は動的にロード
  const { performHeavyTask } = await import('./utils/heavy-computation')
  const result = await performHeavyTask()
  return c.json(result)
})
```

### バンドル最適化

`tsconfig.json`での最適化：
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "tree-shaking": true,
    "sideEffects": false
  }
}
```

### キャッシュ戦略

```typescript
import { Hono } from 'hono'

const app = new Hono()

// 静的リソースの長期キャッシュ
app.get('/static/*', (c) => {
  c.header('Cache-Control', 'public, max-age=31536000, immutable')
  // 静的ファイルの配信...
})

// APIレスポンスの短期キャッシュ
app.get('/api/public-data', (c) => {
  c.header('Cache-Control', 'public, max-age=300') // 5分間キャッシュ
  return c.json({ data: 'public information' })
})

// キャッシュを無効にする
app.get('/api/user-data', (c) => {
  c.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  return c.json({ sensitive: 'user data' })
})
```

## モニタリングとログ

### 構造化ログの実装

```typescript
interface LogData {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: string
  requestId?: string
  userId?: string
  duration?: number
  error?: {
    name: string
    message: string
    stack?: string
  }
}

const logger = {
  info: (message: string, data: Partial<LogData> = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...data
    }))
  },

  error: (message: string, error: Error, data: Partial<LogData> = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...data
    }))
  }
}

// ログミドルウェア
const loggingMiddleware = async (c: any, next: any) => {
  const requestId = crypto.randomUUID()
  const start = Date.now()

  c.set('requestId', requestId)

  logger.info('Request started', {
    requestId,
    method: c.req.method,
    url: c.req.url
  })

  try {
    await next()

    const duration = Date.now() - start
    logger.info('Request completed', {
      requestId,
      duration,
      status: c.res.status
    })

  } catch (error) {
    const duration = Date.now() - start
    logger.error('Request failed', error, {
      requestId,
      duration
    })
    throw error
  }
}

app.use('*', loggingMiddleware)
```

### ヘルスチェックエンドポイント

```typescript
app.get('/health', async (c) => {
  const checks = {
    server: 'ok',
    database: 'unknown',
    redis: 'unknown',
    external_api: 'unknown'
  }

  let overallStatus = 'ok'

  // データベース接続チェック
  try {
    await db.raw('SELECT 1')
    checks.database = 'ok'
  } catch (error) {
    checks.database = 'error'
    overallStatus = 'error'
  }

  // Redis接続チェック
  try {
    await redis.ping()
    checks.redis = 'ok'
  } catch (error) {
    checks.redis = 'error'
    overallStatus = 'degraded'
  }

  const statusCode = overallStatus === 'ok' ? 200 :
                    overallStatus === 'degraded' ? 200 : 503

  return c.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    checks
  }, statusCode)
})
```

## セキュリティ対策

### 本番環境での設定

```typescript
import { secureHeaders } from 'hono/secure-headers'
import { cors } from 'hono/cors'

const app = new Hono()

// セキュリティヘッダーの設定
app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"]
  },
  crossOriginEmbedderPolicy: false
}))

// CORS設定
app.use('*', cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting (Cloudflare Workers の場合)
const rateLimit = new Map<string, { count: number; resetTime: number }>()

app.use('/api/*', async (c, next) => {
  const clientIP = c.req.header('CF-Connecting-IP') || 'unknown'
  const now = Date.now()
  const windowMs = 60000 // 1分
  const maxRequests = 100

  const limit = rateLimit.get(clientIP)

  if (!limit || now > limit.resetTime) {
    rateLimit.set(clientIP, { count: 1, resetTime: now + windowMs })
  } else if (limit.count >= maxRequests) {
    return c.json({ error: 'Too many requests' }, 429)
  } else {
    limit.count++
  }

  await next()
})
```

## やってみよう！

実際にデプロイパイプラインを構築してみましょう：

1. **マルチプラットフォームデプロイ**
   - Cloudflare Workers
   - Vercel
   - AWS Lambda
   - それぞれの特性を活かした最適化

2. **CI/CDパイプライン**
   - GitHub Actions での自動テスト
   - 段階的デプロイメント
   - ロールバック機能

3. **監視システム**
   - ヘルスチェックエンドポイント
   - エラー通知システム
   - パフォーマンス監視

## ポイント

- **プラットフォーム選択**：要件に応じた最適なデプロイ先の選択
- **自動化**：CI/CDパイプラインによる品質保証とデプロイの自動化
- **監視体制**：ログとメトリクスによる運用状況の把握
- **セキュリティ**：本番環境でのセキュリティ対策の徹底
- **最適化**：各プラットフォームの特性を活かしたパフォーマンス最適化

## 参考文献

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Deno Deploy Documentation](https://deno.com/deploy/docs)
- [Vercel Functions](https://vercel.com/docs/functions)
- [AWS Lambda with Node.js](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html)
- [Google Cloud Run](https://cloud.google.com/run/docs)
