# ミドルウェア活用

ミドルウェアは、リクエストとレスポンスの間で実行される処理のことです。認証、ログ出力、CORS設定、エラーハンドリングなど、アプリケーション全体で共通して必要な機能を効率的に実装できます。Honoのミドルウェアシステムについて詳しく学んでいきましょう。

## ミドルウェアの基本概念

### ミドルウェアの動作流れ

```typescript
import { Hono } from 'hono'

const app = new Hono()

// ミドルウェア1（前処理）
app.use('*', async (c, next) => {
  console.log('Before request processing')
  await next() // 次の処理へ
  console.log('After request processing')
})

// ミドルウェア2（認証）
app.use('/api/*', async (c, next) => {
  console.log('Authentication check')
  await next()
})

// ルートハンドラー
app.get('/api/data', (c) => {
  console.log('Route handler')
  return c.json({ message: 'Hello' })
})

export default app
```

実行順序：
1. Before request processing
2. Authentication check
3. Route handler
4. After request processing

「`next()`を呼ぶことで、次の処理に制御を渡せます。」

### ミドルウェアの種類

```typescript
// 1. 全ての経路に適用
app.use('*', middleware)

// 2. 特定のパスに適用
app.use('/api/*', middleware)

// 3. 特定のメソッドとパスに適用
app.use('GET', '/admin/*', middleware)

// 4. 複数パスに適用
app.use(['/api/*', '/admin/*'], middleware)
```

## 組み込みミドルウェア

Honoには便利な組み込みミドルウェアが用意されています。

### 1. Logger（ログ出力）

```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())

app.get('/', (c) => c.text('Hello'))

// コンソール出力例：
// GET / 200 - 2.34ms
```

### 2. CORS（Cross-Origin Resource Sharing）

```typescript
import { cors } from 'hono/cors'

// 基本的なCORS設定
app.use('*', cors())

// カスタム設定
app.use('/api/*', cors({
  origin: ['https://example.com', 'https://app.example.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// 動的なorigin設定
app.use('/api/*', cors({
  origin: (origin) => {
    return origin?.endsWith('.example.com') ? origin : 'https://example.com'
  }
}))
```

### 3. JWT認証

```typescript
import { jwt } from 'hono/jwt'

app.use('/api/protected/*', jwt({
  secret: 'your-secret-key'
}))

// JWTが検証されたルート
app.get('/api/protected/user', (c) => {
  const payload = c.get('jwtPayload')
  return c.json({ user: payload })
})
```

### 4. Basic認証

```typescript
import { basicAuth } from 'hono/basic-auth'

app.use('/admin/*', basicAuth({
  username: 'admin',
  password: 'secret'
}))

// 複数ユーザー対応
app.use('/admin/*', basicAuth({
  verifyUser: (username, password, c) => {
    return username === 'admin' && password === 'secret123' ||
           username === 'user' && password === 'user123'
  }
}))
```

### 5. プリティ印刷

```typescript
import { prettyJSON } from 'hono/pretty-json'

app.use('*', prettyJSON())

app.get('/api/data', (c) => {
  return c.json({
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
  })
})

// JSONが整形されて出力される
```

### 6. セキュアヘッダー

```typescript
import { secureHeaders } from 'hono/secure-headers'

app.use('*', secureHeaders())

// カスタム設定
app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"]
  },
  crossOriginEmbedderPolicy: false
}))
```

## カスタムミドルウェアの作成

### 基本的なミドルウェア

```typescript
// リクエスト時刻を記録するミドルウェア
const timing = async (c: any, next: any) => {
  const start = Date.now()
  await next()
  const end = Date.now()
  console.log(`Request took ${end - start}ms`)
}

app.use('*', timing)
```

### リクエストIDミドルウェア

```typescript
const requestId = async (c: any, next: any) => {
  const id = crypto.randomUUID()
  c.set('requestId', id)
  c.header('X-Request-ID', id)
  await next()
}

app.use('*', requestId)

app.get('/test', (c) => {
  const requestId = c.get('requestId')
  return c.json({ requestId })
})
```

### API制限ミドルウェア（Rate Limiting）

```typescript
interface RateLimit {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimit>()

const rateLimit = (maxRequests: number, windowMs: number) => {
  return async (c: any, next: any) => {
    const ip = c.req.header('CF-Connecting-IP') ||
               c.req.header('X-Forwarded-For') ||
               'unknown'

    const now = Date.now()
    const limit = rateLimitMap.get(ip)

    if (!limit || now > limit.resetTime) {
      // 新しいウィンドウ
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + windowMs
      })
      await next()
    } else if (limit.count < maxRequests) {
      // まだ制限内
      limit.count++
      await next()
    } else {
      // 制限超過
      return c.json({
        error: 'Too many requests',
        retryAfter: Math.ceil((limit.resetTime - now) / 1000)
      }, 429)
    }
  }
}

// 使用例：1分間に10回まで
app.use('/api/*', rateLimit(10, 60 * 1000))
```

### キャッシュミドルウェア

```typescript
const cache = new Map<string, { data: any, expires: number }>()

const cacheMiddleware = (ttlSeconds: number) => {
  return async (c: any, next: any) => {
    const key = `${c.req.method}:${c.req.url}`
    const cached = cache.get(key)

    if (cached && cached.expires > Date.now()) {
      // キャッシュヒット
      c.header('X-Cache', 'HIT')
      return c.json(cached.data)
    }

    // 元の処理を実行
    await next()

    // レスポンスをキャッシュ（JSONの場合のみ）
    const response = c.res
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.clone().json()
      cache.set(key, {
        data,
        expires: Date.now() + (ttlSeconds * 1000)
      })
      c.header('X-Cache', 'MISS')
    }
  }
}

app.use('/api/cache/*', cacheMiddleware(300)) // 5分間キャッシュ
```

## エラーハンドリングミドルウェア

### グローバルエラーハンドラー

```typescript
const errorHandler = async (c: any, next: any) => {
  try {
    await next()
  } catch (error) {
    console.error('Global error:', error)

    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation Error',
        details: error.errors
      }, 400)
    }

    if (error.message === 'Unauthorized') {
      return c.json({ error: 'Authentication required' }, 401)
    }

    return c.json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    }, 500)
  }
}

app.use('*', errorHandler)
```

### 非同期エラーのキャッチ

```typescript
const asyncHandler = (fn: Function) => {
  return async (c: any, next: any) => {
    try {
      await fn(c, next)
    } catch (error) {
      // エラーを次のエラーハンドラーに渡す
      throw error
    }
  }
}

// 使用例
app.get('/api/data', asyncHandler(async (c) => {
  const data = await riskyAsyncOperation()
  return c.json(data)
}))
```

## ミドルウェアの組み合わせ

複数のミドルウェアを効果的に組み合わせる例：

```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

// 1. 全体的なミドルウェア
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://myapp.com'],
  credentials: true
}))
app.use('*', prettyJSON())

// 2. API用のミドルウェア
app.use('/api/*', async (c, next) => {
  c.header('X-API-Version', 'v1.0.0')
  await next()
})

// 3. 保護されたルート用のミドルウェア
app.use('/api/protected/*', jwt({ secret: 'secret' }))
app.use('/api/protected/*', rateLimit(100, 60 * 1000)) // 分間100リクエスト

// 4. 管理者用のミドルウェア
app.use('/api/admin/*', basicAuth({
  username: 'admin',
  password: 'secret'
}))

// ルート定義
app.get('/api/public', (c) => c.json({ message: 'Public API' }))
app.get('/api/protected/user', (c) => c.json({ message: 'Protected API' }))
app.get('/api/admin/stats', (c) => c.json({ message: 'Admin API' }))

export default app
```

## 条件付きミドルウェア

特定の条件でのみミドルウェアを実行：

```typescript
const conditionalAuth = async (c: any, next: any) => {
  const path = c.req.url
  const method = c.req.method

  // GET リクエストは認証不要
  if (method === 'GET') {
    await next()
    return
  }

  // POST/PUT/DELETE は認証必須
  const token = c.req.header('Authorization')
  if (!token) {
    return c.json({ error: 'Authorization required' }, 401)
  }

  // トークン検証...
  await next()
}

app.use('/api/posts/*', conditionalAuth)
```

## ミドルウェアのテスト

```typescript
import { describe, it, expect } from 'vitest'

describe('Rate Limit Middleware', () => {
  it('should allow requests within limit', async () => {
    const app = new Hono()
    app.use('*', rateLimit(2, 1000))
    app.get('/', (c) => c.json({ ok: true }))

    // 最初のリクエスト
    const res1 = await app.request('/')
    expect(res1.status).toBe(200)

    // 2回目のリクエスト
    const res2 = await app.request('/')
    expect(res2.status).toBe(200)

    // 3回目のリクエスト（制限超過）
    const res3 = await app.request('/')
    expect(res3.status).toBe(429)
  })
})
```

## パフォーマンス考慮事項

### ミドルウェアの順序

```typescript
// ❌ 非効率な順序
app.use('*', heavyComputationMiddleware) // 重い処理
app.use('/api/*', authMiddleware)        // 認証

// ✅ 効率的な順序
app.use('/api/*', authMiddleware)        // 認証（早期リターン可能）
app.use('/api/*', heavyComputationMiddleware) // 重い処理
```

### メモリリーク対策

```typescript
// ❌ メモリリークの可能性
const globalCache = new Map()

const badCacheMiddleware = async (c: any, next: any) => {
  globalCache.set(c.req.url, 'some data') // 無制限にデータが蓄積
  await next()
}

// ✅ サイズ制限付きキャッシュ
class LRUCache<K, V> {
  private cache = new Map<K, V>()

  constructor(private maxSize: number) {}

  set(key: K, value: V) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // LRU: 最近使用したものを末尾に移動
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }
}

const cache = new LRUCache<string, any>(1000)
```

## やってみよう！

実践的なミドルウェアを作成してみましょう：

1. **アクセス統計ミドルウェア**
   - エンドポイントごとのアクセス数を記録
   - 統計情報をAPIで取得可能

2. **リクエストサイズ制限ミドルウェア**
   - JSONペイロードのサイズを制限
   - 大きすぎるリクエストを拒否

3. **セッションミドルウェア**
   - シンプルなセッション管理機能
   - メモリ内でセッションを管理

## ポイント

- **ミドルウェアチェーン**：`next()`による処理の連携
- **組み込みミドルウェア**：認証、CORS、ログなどの便利な機能
- **カスタムミドルウェア**：アプリケーション固有の処理を共通化
- **エラーハンドリング**：グローバルなエラー処理の実装
- **パフォーマンス**：ミドルウェアの順序とメモリ使用量の最適化

## 参考文献

- [Hono Middleware Documentation](https://hono.dev/middleware)
- [Building Custom Middleware](https://hono.dev/guides/middleware)
- [Security Best Practices](https://hono.dev/middleware/builtin/secure-headers)
