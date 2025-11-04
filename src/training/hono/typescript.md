---
created: 2025-09-03 12:00:00+09:00
---

# TypeScriptとHono型システム

HonoはTypeScriptファーストのフレームワークとして設計されており、強力な型システムを提供しています。これにより、開発時にエラーを早期発見でき、IDEでの補完機能も充実します。この章では、HonoとTypeScriptの組み合わせを最大限活用する方法について学んでいきましょう。

## Honoの型安全性の基礎

### Context型の活用

```typescript
import { Hono, Context } from 'hono'

const app = new Hono()

// Context型を明示的に指定
app.get('/users/:id', (c: Context) => {
  const id = c.req.param('id') // string型として推論される
  const page = c.req.query('page') // string | undefined型として推論される
  
  return c.json({
    userId: id,
    page: page ? parseInt(page) : 1
  })
})
```

「Context型を指定することで、`c.req.param()`や`c.req.query()`の戻り値が適切に型推論されます。」

### ジェネリック型を使った型安全なAPI

```typescript
interface User {
  id: string
  name: string
  email: string
}

interface CreateUserRequest {
  name: string
  email: string
}

app.post('/users', async (c) => {
  // 型安全なJSONパース
  const body = await c.req.json<CreateUserRequest>()
  
  const user: User = {
    id: crypto.randomUUID(),
    name: body.name, // TypeScriptが型をチェック
    email: body.email
  }
  
  // 型安全なJSONレスポンス
  return c.json<User>(user, 201)
})
```

## Honoの高度な型機能

### 型付きルートパラメータ

```typescript
// ルートパラメータの型を定義
type UserParams = {
  id: string
}

type PostParams = {
  userId: string
  postId: string
}

app.get('/users/:id', (c) => {
  const { id } = c.req.param() // 自動的に型推論される
  return c.json({ userId: id })
})

app.get('/users/:userId/posts/:postId', (c) => {
  const { userId, postId } = c.req.param()
  return c.json({ userId, postId })
})
```

### 型付きクエリパラメータ

```typescript
interface SearchQuery {
  q?: string
  page?: string
  limit?: string
  sort?: 'name' | 'date'
}

app.get('/search', (c) => {
  const query = c.req.query() // Record<string, string>型
  
  // より型安全な方法
  const q = c.req.query('q')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '10')
  const sort = c.req.query('sort') as 'name' | 'date' | undefined
  
  return c.json({ q, page, limit, sort })
})
```

## Zodとの連携による高度なバリデーション

```typescript
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

// スキーマ定義
const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).max(150),
  tags: z.array(z.string()).optional()
})

const UpdateUserSchema = CreateUserSchema.partial()

type CreateUserRequest = z.infer<typeof CreateUserSchema>
type UpdateUserRequest = z.infer<typeof UpdateUserSchema>

// バリデーションミドルウェアの使用
app.post('/users', zValidator('json', CreateUserSchema), async (c) => {
  const user = c.req.valid('json') // CreateUserRequest型で型推論される
  
  // userの各プロパティが型安全にアクセス可能
  console.log(user.name, user.email, user.age)
  
  return c.json({ message: 'User created', user })
})
```

「`zValidator`を使うことで、バリデーションと型推論が同時に行われます。非常に便利ですね。」

## カスタム型定義

### レスポンス型の統一

```typescript
interface ApiResponse<T> {
  data: T
  message?: string
  timestamp: string
}

interface ErrorResponse {
  error: string
  message?: string
  details?: any[]
  timestamp: string
  path: string
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  timestamp: string
}

// 型安全なレスポンスヘルパー
const createApiResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  data,
  message,
  timestamp: new Date().toISOString()
})

const createErrorResponse = (
  error: string,
  message?: string,
  details?: any[],
  path?: string
): ErrorResponse => ({
  error,
  message,
  details,
  timestamp: new Date().toISOString(),
  path: path || ''
})

app.get('/users/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    const user = await getUserById(id)
    
    if (!user) {
      const errorResponse = createErrorResponse(
        'USER_NOT_FOUND',
        `User with ID ${id} not found`,
        undefined,
        c.req.url
      )
      return c.json(errorResponse, 404)
    }
    
    const response = createApiResponse(user, 'User retrieved successfully')
    return c.json(response)
    
  } catch (error) {
    const errorResponse = createErrorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred',
      [error],
      c.req.url
    )
    return c.json(errorResponse, 500)
  }
})
```

### 環境変数の型定義

```typescript
interface Environment {
  PORT: number
  DATABASE_URL: string
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  NODE_ENV: 'development' | 'production' | 'test'
  CORS_ORIGINS: string[]
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'
}

const parseEnvironment = (): Environment => {
  const requiredEnvVars = {
    PORT: parseInt(process.env.PORT || '3000'),
    DATABASE_URL: process.env.DATABASE_URL || 'sqlite://app.db',
    JWT_SECRET: process.env.JWT_SECRET || (() => {
      throw new Error('JWT_SECRET is required')
    })(),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    NODE_ENV: (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
    CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    LOG_LEVEL: (process.env.LOG_LEVEL as Environment['LOG_LEVEL']) || 'info'
  }
  
  return requiredEnvVars
}

export const env = parseEnvironment()
```

## 型安全なミドルウェア

### ジェネリックミドルウェア

```typescript
interface AuthenticatedUser {
  id: string
  email: string
  role: 'user' | 'admin'
}

// 型安全な認証ミドルウェア
const authenticateUser = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  try {
    const user: AuthenticatedUser = await verifyToken(token)
    c.set('user', user) // ユーザー情報を Context に設定
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

// 認証されたユーザー情報を型安全に取得
app.get('/profile', authenticateUser, (c) => {
  const user = c.get('user') as AuthenticatedUser // 型アサーションが必要
  return c.json({
    id: user.id,
    email: user.email,
    role: user.role
  })
})
```

### より型安全なアプローチ

```typescript
// カスタム Context 型を定義
interface AuthenticatedContext extends Context {
  get(key: 'user'): AuthenticatedUser
}

// 型ガード関数
const isAuthenticated = (c: Context): c is AuthenticatedContext => {
  return c.get('user') !== undefined
}

app.get('/profile', authenticateUser, (c) => {
  if (!isAuthenticated(c)) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  const user = c.get('user') // AuthenticatedUser型で推論される
  return c.json({
    id: user.id,
    email: user.email,
    role: user.role
  })
})
```

## データベースとの型連携

### Prismaとの組み合わせ

```typescript
// schema.prisma
/*
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id       String @id @default(cuid())
  title    String
  content  String
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}
*/

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Prismaの型を直接使用
app.get('/users', async (c) => {
  const users = await prisma.user.findMany({
    include: {
      posts: true
    }
  })
  
  // users は User & { posts: Post[] } 型で推論される
  return c.json(users)
})

app.post('/users', zValidator('json', CreateUserSchema), async (c) => {
  const userData = c.req.valid('json')
  
  const user = await prisma.user.create({
    data: userData
  })
  
  return c.json(user, 201)
})
```

### DrizzleORMとの組み合わせ

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core'

// スキーマ定義
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  age: integer('age'),
  createdAt: text('created_at').notNull()
})

// 型推論
export type User = typeof users.$inferSelect
export type CreateUser = typeof users.$inferInsert

const db = drizzle(sqlite)

app.get('/users', async (c) => {
  const allUsers = await db.select().from(users)
  // allUsers は User[] 型で推論される
  return c.json(allUsers)
})
```

## 型安全なテスト

```typescript
import { describe, it, expect } from 'vitest'
import { testClient } from 'hono/testing'

describe('User API', () => {
  const client = testClient(app)
  
  it('should create user', async () => {
    const userData: CreateUserRequest = {
      name: 'John Doe',
      email: 'john@example.com'
    }
    
    const res = await client.users.$post({
      json: userData
    })
    
    expect(res.status).toBe(201)
    
    const user = await res.json()
    expect(user).toMatchObject({
      name: userData.name,
      email: userData.email
    })
  })
  
  it('should validate input', async () => {
    const invalidData = {
      name: '', // 空文字列は無効
      email: 'invalid-email'
    }
    
    const res = await client.users.$post({
      json: invalidData
    })
    
    expect(res.status).toBe(400)
    
    const error = await res.json()
    expect(error).toHaveProperty('error', 'Validation failed')
  })
})
```

## TypeScriptの設定最適化

### 厳密な設定

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/types/*": ["types/*"],
      "@/utils/*": ["utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 型チェックスクリプト

`package.json`:
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  }
}
```

## 実践的な型設計パターン

### 状態管理の型安全性

```typescript
type LoadingState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

interface ApiState<T> {
  data: LoadingState<T>
  refetch: () => Promise<void>
}

// 使用例
app.get('/users/:id', async (c) => {
  const id = c.req.param('id')
  let state: LoadingState<User> = { status: 'loading' }
  
  try {
    const user = await getUserById(id)
    if (user) {
      state = { status: 'success', data: user }
    } else {
      state = { status: 'error', error: 'User not found' }
    }
  } catch (error) {
    state = { status: 'error', error: error.message }
  }
  
  return c.json(state)
})
```

## やってみよう！

型安全性を活用したAPIを作成してみましょう：

1. **強い型付きのCRUD API**
   - Zodバリデーション付き
   - Prisma/DrizzleORMとの連携
   - エラーハンドリングの型安全性

2. **認証システムの型定義**
   - JWT ペイロードの型定義
   - ロールベースアクセス制御
   - ミドルウェアの型安全性

3. **テストコードの型安全性**
   - テストケースでの型推論
   - モックデータの型定義

## ポイント

- **型推論の活用**：TypeScriptの強力な型推論を最大限活用
- **Zodとの連携**：バリデーションと型定義の統一
- **カスタム型定義**：アプリケーション固有の型システム構築
- **厳密な設定**：TypeScriptコンパイラの厳密な設定活用
- **型安全なテスト**：テストコードでも型安全性を確保

## 参考文献

- [Hono Type System](https://hono.dev/api/context)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [Prisma TypeScript](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client)
