# エラーハンドリング

堅牢なWebアプリケーションを構築するには、適切なエラーハンドリングが不可欠です。予期しないエラーからアプリケーションを保護し、ユーザーに分かりやすいエラーメッセージを提供する方法について学んでいきましょう。

## エラーハンドリングの基本概念

### エラーの種類

Webアプリケーションで発生するエラーは大きく分けて以下の種類があります：

1. **クライアントエラー（4xx）**
   - バリデーションエラー（400 Bad Request）
   - 認証エラー（401 Unauthorized）
   - 認可エラー（403 Forbidden）
   - リソースが見つからない（404 Not Found）

2. **サーバーエラー（5xx）**
   - 内部サーバーエラー（500 Internal Server Error）
   - データベース接続エラー
   - 外部API連携エラー

## Honoでのエラーハンドリング

### 基本的なエラーレスポンス

```typescript
import { Hono } from 'hono'

const app = new Hono()

app.get('/users/:id', async (c) => {
  const id = c.req.param('id')

  // バリデーション
  if (!id || !/^\d+$/.test(id)) {
    return c.json({
      error: 'INVALID_ID',
      message: 'User ID must be a positive integer'
    }, 400)
  }

  try {
    const user = await getUserById(id)

    if (!user) {
      return c.json({
        error: 'USER_NOT_FOUND',
        message: `User with ID ${id} not found`
      }, 404)
    }

    return c.json(user)

  } catch (error) {
    console.error('Error fetching user:', error)
    return c.json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }, 500)
  }
})
```

### グローバルエラーハンドラーの実装

```typescript
import { Hono } from 'hono'

class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

const app = new Hono()

// グローバルエラーハンドラー
const errorHandler = async (c: any, next: any) => {
  try {
    await next()
  } catch (error) {
    console.error('Global error handler:', error)

    if (error instanceof AppError) {
      return c.json({
        error: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        path: c.req.url
      }, error.statusCode)
    }

    // 予期しないエラー
    return c.json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: c.req.url
    }, 500)
  }
}

app.use('*', errorHandler)

// 使用例
app.get('/users/:id', async (c) => {
  const id = c.req.param('id')

  if (!id || !/^\d+$/.test(id)) {
    throw new AppError(400, 'INVALID_ID', 'User ID must be a positive integer')
  }

  const user = await getUserById(id)
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', `User with ID ${id} not found`)
  }

  return c.json(user)
})
```

「カスタムエラークラスを使うことで、エラーの詳細情報を構造化できますね。」

## 詳細なエラー分類

### エラーコードの体系化

```typescript
// エラーコード定義
export const ErrorCodes = {
  // バリデーションエラー
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_ID: 'INVALID_ID',
  INVALID_EMAIL: 'INVALID_EMAIL',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',

  // 認証・認可エラー
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // リソースエラー
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',

  // ビジネスロジックエラー
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  ORDER_ALREADY_PROCESSED: 'ORDER_ALREADY_PROCESSED',
  INVALID_OPERATION: 'INVALID_OPERATION',

  // システムエラー
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

// エラークラスの拡張
class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, ErrorCodes.VALIDATION_FAILED, message, details)
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, `${resource.toUpperCase()}_NOT_FOUND`, `${resource} with ID ${id} not found`)
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, ErrorCodes.AUTHENTICATION_REQUIRED, message)
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(403, ErrorCodes.INSUFFICIENT_PERMISSIONS, message)
  }
}
```

### 非同期エラーのハンドリング

```typescript
// 非同期処理をラップするヘルパー
const asyncHandler = (fn: Function) => {
  return async (c: any, next?: any) => {
    try {
      return await fn(c, next)
    } catch (error) {
      // エラーを上位のエラーハンドラーに渡す
      throw error
    }
  }
}

// 使用例
app.get('/users/:id', asyncHandler(async (c) => {
  const id = c.req.param('id')
  const user = await getUserById(id) // この処理でエラーが発生する可能性

  if (!user) {
    throw new NotFoundError('User', id)
  }

  return c.json(user)
}))
```

## Zodバリデーションとエラーハンドリング

### 詳細なバリデーションエラー

```typescript
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const CreateUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email format'),
  age: z.number()
    .int('Age must be an integer')
    .min(0, 'Age must be positive')
    .max(150, 'Age must be realistic'),
  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional()
})

// カスタムバリデーションエラーハンドラー
const validationErrorHandler = (result: any, c: any) => {
  if (!result.success) {
    const errors = result.error.errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))

    return c.json({
      error: ErrorCodes.VALIDATION_FAILED,
      message: 'Validation failed',
      details: errors,
      timestamp: new Date().toISOString(),
      path: c.req.url
    }, 400)
  }
}

app.post('/users',
  zValidator('json', CreateUserSchema, validationErrorHandler),
  asyncHandler(async (c) => {
    const userData = c.req.valid('json')
    const user = await createUser(userData)
    return c.json(user, 201)
  })
)
```

### カスタムZodエラーメッセージ

```typescript
const UserUpdateSchema = z.object({
  name: z.string()
    .min(1, { message: 'お名前は必須です' })
    .max(100, { message: 'お名前は100文字以内で入力してください' }),
  email: z.string()
    .email({ message: 'メールアドレスの形式が正しくありません' }),
  bio: z.string()
    .max(1000, { message: '自己紹介は1000文字以内で入力してください' })
    .optional()
}).refine(
  (data) => data.name !== 'admin',
  {
    message: 'この名前は使用できません',
    path: ['name']
  }
)
```

## データベースエラーのハンドリング

### Prismaエラーの処理

```typescript
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client'

const handlePrismaError = (error: any) => {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return new AppError(409, ErrorCodes.RESOURCE_ALREADY_EXISTS,
          'A record with this information already exists')

      case 'P2025': // Record not found
        return new NotFoundError('Resource', 'unknown')

      case 'P2003': // Foreign key constraint violation
        return new ValidationError('Referenced resource does not exist')

      default:
        return new AppError(500, ErrorCodes.DATABASE_ERROR, 'Database operation failed')
    }
  }

  if (error instanceof PrismaClientValidationError) {
    return new ValidationError('Invalid data provided')
  }

  return new AppError(500, ErrorCodes.DATABASE_ERROR, 'Database error occurred')
}

app.post('/users', asyncHandler(async (c) => {
  try {
    const userData = await c.req.json()
    const user = await prisma.user.create({ data: userData })
    return c.json(user, 201)

  } catch (error) {
    throw handlePrismaError(error)
  }
}))
```

## 外部API連携のエラーハンドリング

### HTTPクライアントエラーの処理

```typescript
class ExternalServiceError extends AppError {
  constructor(service: string, statusCode: number, message: string) {
    super(502, ErrorCodes.EXTERNAL_SERVICE_ERROR,
      `External service ${service} error: ${message}`)
  }
}

const callExternalAPI = async (url: string, options: any) => {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new ExternalServiceError(
        'Payment Service',
        response.status,
        `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()

  } catch (error) {
    if (error instanceof ExternalServiceError) {
      throw error
    }

    // ネットワークエラーなど
    throw new AppError(503, ErrorCodes.EXTERNAL_SERVICE_ERROR,
      'External service is currently unavailable')
  }
}
```

### リトライ機能付きエラーハンドリング

```typescript
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // リトライしないエラーの判定
      if (error instanceof AppError && error.statusCode < 500) {
        throw error
      }

      if (attempt === maxRetries) {
        break
      }

      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2 // Exponential backoff
    }
  }

  throw lastError
}

app.get('/external-data', asyncHandler(async (c) => {
  const data = await withRetry(() =>
    callExternalAPI('https://api.example.com/data', { method: 'GET' })
  )

  return c.json(data)
}))
```

## ログとモニタリング

### 構造化ログ

```typescript
interface LogContext {
  requestId: string
  userId?: string
  action: string
  resource?: string
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  duration?: number
  statusCode: number
}

const logger = {
  error: (context: LogContext, message: string) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }))
  },

  warn: (context: Partial<LogContext>, message: string) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }))
  },

  info: (context: Partial<LogContext>, message: string) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }))
  }
}

// 拡張されたエラーハンドラー
const enhancedErrorHandler = async (c: any, next: any) => {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  c.set('requestId', requestId)

  try {
    await next()

    const duration = Date.now() - startTime
    logger.info({
      requestId,
      action: `${c.req.method} ${c.req.url}`,
      duration,
      statusCode: 200
    }, 'Request completed')

  } catch (error) {
    const duration = Date.now() - startTime
    const userId = c.get('user')?.id

    if (error instanceof AppError) {
      logger.warn({
        requestId,
        userId,
        action: `${c.req.method} ${c.req.url}`,
        duration,
        statusCode: error.statusCode,
        error: {
          name: error.name,
          message: error.message,
          code: error.code
        }
      }, 'Application error occurred')

      return c.json({
        error: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId
      }, error.statusCode)
    }

    // 予期しないエラー
    logger.error({
      requestId,
      userId,
      action: `${c.req.method} ${c.req.url}`,
      duration,
      statusCode: 500,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }, 'Unexpected error occurred')

    return c.json({
      error: ErrorCodes.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId
    }, 500)
  }
}

app.use('*', enhancedErrorHandler)
```

## エラー通知システム

### Slack通知

```typescript
const notifyError = async (error: AppError, context: LogContext) => {
  // 重要なエラーのみ通知
  if (error.statusCode >= 500) {
    const slackMessage = {
      text: `🚨 Server Error Alert`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Error:* ${error.code}\n*Message:* ${error.message}\n*Request:* ${context.action}\n*Request ID:* ${context.requestId}`
          }
        }
      ]
    }

    try {
      await fetch(process.env.SLACK_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
      })
    } catch (notificationError) {
      console.error('Failed to send Slack notification:', notificationError)
    }
  }
}
```

## 開発環境でのエラー表示

```typescript
const isDevelopment = process.env.NODE_ENV === 'development'

const developmentErrorHandler = async (c: any, next: any) => {
  try {
    await next()
  } catch (error) {
    if (isDevelopment) {
      // 開発環境では詳細なエラー情報を返す
      return c.json({
        error: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }, error.statusCode || 500)
    } else {
      // 本番環境では最小限の情報のみ
      return c.json({
        error: 'INTERNAL_ERROR',
        message: 'An error occurred',
        timestamp: new Date().toISOString()
      }, 500)
    }
  }
}
```

## やってみよう！

堅牢なエラーハンドリングシステムを構築してみましょう：

1. **多層エラーハンドリング**
   - グローバルエラーハンドラー
   - 機能別エラーハンドラー
   - バリデーションエラーハンドラー

2. **ログとモニタリング**
   - 構造化ログの実装
   - エラー通知システム
   - パフォーマンス監視

3. **ユーザーフレンドリーなエラー**
   - 分かりやすいエラーメッセージ
   - 多言語対応
   - 回復可能なエラーの提示

## ポイント

- **一貫したエラー形式**：統一されたエラーレスポンス構造
- **適切な分類**：エラーコードによる体系的な分類
- **詳細なログ**：トラブルシューティングに必要な情報の記録
- **グレースフルな処理**：予期しないエラーからのアプリケーション保護
- **開発効率**：開発環境での詳細なエラー情報提供

## 参考文献

- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Error Handling Best Practices](https://www.joyent.com/node-js/production/design/errors)
- [Structured Logging](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/)
