# ファイル構成とコード分割

アプリケーションが成長するにつれ、すべてのコードを1つのファイルに書くのは現実的ではありません。適切なファイル構成とコード分割により、保守性と開発効率を大幅に向上させることができます。Honoアプリケーションでの効果的な構成方法について学んでいきましょう。

## 基本的なプロジェクト構造

### 小規模プロジェクトの構造

```
hono-app/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # メインアプリケーション
│   ├── server.ts         # サーバー起動
│   ├── routes/           # ルート定義
│   │   ├── users.ts
│   │   ├── posts.ts
│   │   └── auth.ts
│   ├── middleware/       # カスタムミドルウェア
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── logger.ts
│   ├── types/           # 型定義
│   │   ├── user.ts
│   │   └── post.ts
│   └── utils/           # ユーティリティ関数
│       ├── crypto.ts
│       └── validation.ts
└── dist/               # ビルド結果
```

### 中・大規模プロジェクトの構造

```
hono-app/
├── package.json
├── tsconfig.json
├── src/
│   ├── app.ts              # アプリケーション設定
│   ├── server.ts           # サーバー起動
│   ├── config/             # 設定ファイル
│   │   ├── index.ts
│   │   ├── database.ts
│   │   └── environment.ts
│   ├── modules/            # 機能モジュール
│   │   ├── users/
│   │   │   ├── routes.ts
│   │   │   ├── handlers.ts
│   │   │   ├── types.ts
│   │   │   ├── validation.ts
│   │   │   └── services.ts
│   │   ├── posts/
│   │   │   ├── routes.ts
│   │   │   ├── handlers.ts
│   │   │   ├── types.ts
│   │   │   └── services.ts
│   │   └── auth/
│   │       ├── routes.ts
│   │       ├── handlers.ts
│   │       ├── middleware.ts
│   │       └── types.ts
│   ├── shared/            # 共通コンポーネント
│   │   ├── middleware/
│   │   ├── types/
│   │   ├── utils/
│   │   └── constants/
│   ├── database/          # データベース関連
│   │   ├── models/
│   │   ├── migrations/
│   │   └── seeds/
│   └── tests/            # テストファイル
│       ├── integration/
│       ├── unit/
│       └── helpers/
├── docker/               # Docker設定
├── scripts/             # ビルドスクリプト
└── dist/               # ビルド結果
```

## ルートの分割

### 基本的なルート分割

`src/routes/users.ts`:
```typescript
import { Hono } from 'hono'

const users = new Hono()

users.get('/', (c) => {
  return c.json({ message: 'Get all users' })
})

users.get('/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ message: `Get user ${id}` })
})

users.post('/', async (c) => {
  const body = await c.req.json()
  return c.json({ message: 'Create user', data: body }, 201)
})

export { users }
```

`src/routes/posts.ts`:
```typescript
import { Hono } from 'hono'

const posts = new Hono()

posts.get('/', (c) => {
  return c.json({ message: 'Get all posts' })
})

posts.get('/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ message: `Get post ${id}` })
})

export { posts }
```

`src/index.ts`:
```typescript
import { Hono } from 'hono'
import { users } from './routes/users'
import { posts } from './routes/posts'

const app = new Hono()

app.route('/api/users', users)
app.route('/api/posts', posts)

export default app
```

「このようにルートを分割することで、機能ごとにファイルを整理できますね。」

## ハンドラーの分離

より複雑なロジックはハンドラー関数として分離しましょう：

`src/handlers/userHandlers.ts`:
```typescript
import { Context } from 'hono'
import { User, CreateUserRequest } from '../types/user'
import { UserService } from '../services/userService'

export class UserHandlers {
  constructor(private userService: UserService) {}

  async getAllUsers(c: Context) {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')

    try {
      const result = await this.userService.getUsers({ page, limit })
      return c.json(result)
    } catch (error) {
      return c.json({ error: 'Failed to fetch users' }, 500)
    }
  }

  async getUserById(c: Context) {
    const id = c.req.param('id')

    try {
      const user = await this.userService.getUserById(id)
      if (!user) {
        return c.json({ error: 'User not found' }, 404)
      }
      return c.json(user)
    } catch (error) {
      return c.json({ error: 'Failed to fetch user' }, 500)
    }
  }

  async createUser(c: Context) {
    try {
      const body = await c.req.json<CreateUserRequest>()
      const user = await this.userService.createUser(body)
      return c.json(user, 201)
    } catch (error) {
      return c.json({ error: 'Failed to create user' }, 400)
    }
  }
}
```

`src/routes/users.ts`:
```typescript
import { Hono } from 'hono'
import { UserHandlers } from '../handlers/userHandlers'
import { UserService } from '../services/userService'

const users = new Hono()
const userService = new UserService()
const userHandlers = new UserHandlers(userService)

users.get('/', (c) => userHandlers.getAllUsers(c))
users.get('/:id', (c) => userHandlers.getUserById(c))
users.post('/', (c) => userHandlers.createUser(c))

export { users }
```

## サービス層の実装

ビジネスロジックをサービス層に分離：

`src/services/userService.ts`:
```typescript
import { User, CreateUserRequest } from '../types/user'
import { DatabaseConnection } from '../database/connection'

export interface PaginationOptions {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class UserService {
  constructor(private db: DatabaseConnection) {}

  async getUsers(options: PaginationOptions): Promise<PaginatedResult<User>> {
    const { page, limit } = options
    const offset = (page - 1) * limit

    const [users, total] = await Promise.all([
      this.db.query('SELECT * FROM users LIMIT ? OFFSET ?', [limit, offset]),
      this.db.query('SELECT COUNT(*) as count FROM users')
    ])

    return {
      data: users,
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit)
      }
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE id = ?', [id])
    return result[0] || null
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const id = crypto.randomUUID()
    const user = {
      id,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await this.db.query(
      'INSERT INTO users (id, name, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.name, user.email, user.createdAt, user.updatedAt]
    )

    return user
  }
}
```

## 型定義の管理

`src/types/user.ts`:
```typescript
export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  name: string
  email: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
}

export interface UserFilters {
  name?: string
  email?: string
  createdAfter?: string
  createdBefore?: string
}
```

`src/types/api.ts`:
```typescript
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ErrorResponse {
  error: string
  message?: string
  details?: any[]
  timestamp: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}
```

## ミドルウェアの分割

`src/middleware/validation.ts`:
```typescript
import { Context, Next } from 'hono'
import { z } from 'zod'

export const validate = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json()
      const validatedData = schema.parse(body)
      c.set('validatedData', validatedData)
      await next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }, 400)
      }
      return c.json({ error: 'Invalid request body' }, 400)
    }
  }
}
```

`src/middleware/auth.ts`:
```typescript
import { Context, Next } from 'hono'
import { jwt } from 'hono/jwt'

export const authenticateUser = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  try {
    // JWTトークンの検証ロジック
    const payload = await verifyJWT(token)
    c.set('user', payload)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

export const requireRole = (role: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user')

    if (!user || user.role !== role) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }

    await next()
  }
}
```

## 設定管理

`src/config/index.ts`:
```typescript
interface Config {
  port: number
  database: {
    url: string
    maxConnections: number
  }
  jwt: {
    secret: string
    expiresIn: string
  }
  cors: {
    origins: string[]
  }
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000'),
  database: {
    url: process.env.DATABASE_URL || 'sqlite://./app.db',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10')
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
  }
}
```

## モジュール化されたアプリケーション

`src/modules/users/index.ts`:
```typescript
import { Hono } from 'hono'
import { UserService } from './services'
import { UserHandlers } from './handlers'
import { userValidation } from './validation'
import { authenticateUser } from '../../shared/middleware/auth'

export function createUserModule() {
  const app = new Hono()
  const userService = new UserService()
  const userHandlers = new UserHandlers(userService)

  // 公開エンドポイント
  app.get('/', (c) => userHandlers.getAllUsers(c))
  app.get('/:id', (c) => userHandlers.getUserById(c))

  // 認証が必要なエンドポイント
  app.use('/*', authenticateUser)
  app.post('/', userValidation.create, (c) => userHandlers.createUser(c))
  app.put('/:id', userValidation.update, (c) => userHandlers.updateUser(c))
  app.delete('/:id', (c) => userHandlers.deleteUser(c))

  return app
}
```

`src/app.ts`:
```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { createUserModule } from './modules/users'
import { createPostModule } from './modules/posts'
import { createAuthModule } from './modules/auth'
import { config } from './config'

export function createApp() {
  const app = new Hono()

  // グローバルミドルウェア
  app.use('*', logger())
  app.use('*', cors({
    origin: config.cors.origins,
    credentials: true
  }))

  // ルートマウント
  app.route('/api/users', createUserModule())
  app.route('/api/posts', createPostModule())
  app.route('/api/auth', createAuthModule())

  // ヘルスチェック
  app.get('/health', (c) => c.json({ status: 'ok' }))

  // 404ハンドラー
  app.notFound((c) => c.json({ error: 'Not Found' }, 404))

  return app
}
```

## ユーティリティ関数の整理

`src/shared/utils/crypto.ts`:
```typescript
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export class CryptoUtils {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  static generateJWT(payload: object, secret: string, expiresIn: string): string {
    return jwt.sign(payload, secret, { expiresIn })
  }

  static verifyJWT(token: string, secret: string): any {
    return jwt.verify(token, secret)
  }
}
```

`src/shared/utils/validation.ts`:
```typescript
import { z } from 'zod'

export const commonSchemas = {
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8),
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10)
  })
}

export const createPaginationSchema = (filters?: z.ZodRawShape) => {
  const base = {
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10)
  }

  return z.object(filters ? { ...base, ...filters } : base)
}
```

## ビルドとデプロイ設定

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/types/*": ["types/*"],
      "@/utils/*": ["shared/utils/*"],
      "@/middleware/*": ["shared/middleware/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests/**/*"]
}
```

## やってみよう！

実際にコード分割を行ったプロジェクトを作成してみましょう：

1. **ブログAPI**
   - ユーザー管理モジュール
   - 記事管理モジュール
   - コメント管理モジュール
   - 認証モジュール

2. **ECサイトAPI**
   - 商品管理
   - 注文管理
   - ユーザー管理
   - 決済処理

3. **タスク管理API**
   - プロジェクト管理
   - タスク管理
   - チーム管理
   - 通知システム

## ベストプラクティス

### 1. フォルダー構造の一貫性
```typescript
// ❌ 不一致な構造
src/
├── userRoutes.ts
├── post-handlers.ts
├── auth_middleware.ts

// ✅ 一貫した構造
src/
├── routes/
│   ├── users.ts
│   └── posts.ts
├── handlers/
│   ├── users.ts
│   └── posts.ts
```

### 2. 循環依存の回避
```typescript
// ❌ 循環依存
// userService.ts
import { PostService } from './postService'

// postService.ts
import { UserService } from './userService'

// ✅ 共通インターフェースを使用
// interfaces/index.ts
export interface IUserService { ... }
export interface IPostService { ... }
```

### 3. 適切な抽象化レベル
```typescript
// ✅ レイヤー分離
Controller -> Service -> Repository -> Database
```

## ポイント

- **モジュール化**：機能ごとにファイルとディレクトリを分割
- **レイヤー分離**：ハンドラー、サービス、リポジトリの明確な分離
- **型安全性**：共通の型定義でタイプセーフティを確保
- **設定管理**：環境変数と設定ファイルの適切な管理
- **再利用性**：共通コンポーネントとユーティリティの活用

## 参考文献

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Node.js Project Structure](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Module System](https://www.typescriptlang.org/docs/handbook/modules.html)
