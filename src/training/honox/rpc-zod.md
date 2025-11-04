# RPC実装とzodバリデーション

HonoXでは、RPC（Remote Procedure Call）パターンとzodバリデーションを組み合わせることで、より型安全で使いやすいAPI設計が可能になります。従来のREST APIとは異なるアプローチで、関数を呼び出すような直感的なAPI利用体験を実現しましょう。

## RPC パターンの理解

### 従来のREST API vs RPC

```typescript
// REST API パターン
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Hello', content: '...' })
})
const post = await response.json()

// RPC パターン
const post = await api.posts.create({
  title: 'Hello',
  content: '...'
})
```

「RPCパターンでは、リモートの関数をローカルの関数のように呼び出せます。」

### Hono RPC の基本実装

```typescript
// app/lib/rpc/server.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

// バリデーションスキーマ
const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(10000),
  excerpt: z.string().max(500).optional(),
  tags: z.array(z.string()).max(10).optional(),
  status: z.enum(['draft', 'published']).default('draft')
})

const UpdatePostSchema = CreatePostSchema.partial()

const PostQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  tag: z.string().optional(),
  author: z.string().optional(),
  status: z.enum(['draft', 'published']).optional()
})

// RPC API定義
export const postsAPI = new Hono()

// 投稿一覧取得
postsAPI.get(
  '/',
  zValidator('query', PostQuerySchema),
  async (c) => {
    const query = c.req.valid('query')

    try {
      const posts = await PostService.getList(query)
      return c.json({
        success: true,
        data: posts,
        pagination: {
          page: query.page,
          limit: query.limit,
          hasNext: posts.length === query.limit
        }
      })
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to fetch posts'
      }, 500)
    }
  }
)

// 投稿作成
postsAPI.post(
  '/',
  zValidator('json', CreatePostSchema),
  async (c) => {
    const postData = c.req.valid('json')
    const user = c.get('user') // 認証ミドルウェアから取得

    try {
      const post = await PostService.create({
        ...postData,
        authorId: user.id
      })

      return c.json({
        success: true,
        data: post
      }, 201)
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to create post'
      }, 500)
    }
  }
)

// 投稿更新
postsAPI.put(
  '/:id',
  zValidator('json', UpdatePostSchema),
  async (c) => {
    const id = c.req.param('id')
    const updateData = c.req.valid('json')
    const user = c.get('user')

    try {
      const post = await PostService.update(id, updateData, user.id)

      if (!post) {
        return c.json({
          success: false,
          error: 'Post not found or unauthorized'
        }, 404)
      }

      return c.json({
        success: true,
        data: post
      })
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to update post'
      }, 500)
    }
  }
)

// 投稿削除
postsAPI.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')

  try {
    const success = await PostService.delete(id, user.id)

    if (!success) {
      return c.json({
        success: false,
        error: 'Post not found or unauthorized'
      }, 404)
    }

    return c.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to delete post'
    }, 500)
  }
})

// 型推論のためのAPIスキーマ
export type PostsAPI = typeof postsAPI
```

## 高度なzodバリデーション

### 複雑なスキーマ定義

```typescript
// app/lib/schemas/user.ts
import { z } from 'zod'

// カスタムバリデーション関数
const isStrongPassword = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return password.length >= 8 &&
         hasUpperCase &&
         hasLowerCase &&
         hasNumbers &&
         hasSpecialChar
}

// ユーザー関連スキーマ
export const UserSchemas = {
  // ユーザー登録
  register: z.object({
    email: z.string()
      .email('有効なメールアドレスを入力してください')
      .max(255, 'メールアドレスが長すぎます'),

    password: z.string()
      .min(8, 'パスワードは8文字以上である必要があります')
      .refine(isStrongPassword, {
        message: 'パスワードは大文字、小文字、数字、特殊文字を含む必要があります'
      }),

    confirmPassword: z.string(),

    name: z.string()
      .min(1, '名前は必須です')
      .max(100, '名前は100文字以内で入力してください')
      .regex(/^[^\s].*[^\s]$/, '名前の前後に空白を含めることはできません'),

    profile: z.object({
      bio: z.string()
        .max(500, '自己紹介は500文字以内で入力してください')
        .optional(),

      website: z.string()
        .url('有効なURLを入力してください')
        .optional()
        .or(z.literal('')),

      birthday: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, '日付はYYYY-MM-DD形式で入力してください')
        .optional()
        .refine((date) => {
          if (!date) return true
          const birthDate = new Date(date)
          const today = new Date()
          const age = today.getFullYear() - birthDate.getFullYear()
          return age >= 13 && age <= 120
        }, {
          message: '年齢は13歳以上120歳以下である必要があります'
        })
    }).optional()

  }).refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword']
  }),

  // プロフィール更新
  updateProfile: z.object({
    name: z.string()
      .min(1, '名前は必須です')
      .max(100, '名前は100文字以内で入力してください')
      .optional(),

    profile: z.object({
      bio: z.string().max(500).optional(),
      website: z.string().url().optional().or(z.literal('')),
      avatar: z.string().url().optional(),
      preferences: z.object({
        theme: z.enum(['light', 'dark', 'auto']).default('auto'),
        language: z.enum(['ja', 'en']).default('ja'),
        notifications: z.object({
          email: z.boolean().default(true),
          push: z.boolean().default(false),
          marketing: z.boolean().default(false)
        }).default({})
      }).optional()
    }).optional()
  }),

  // ログイン
  login: z.object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(1, 'パスワードを入力してください'),
    remember: z.boolean().optional().default(false)
  })
}

// 型推論
export type RegisterUserRequest = z.infer<typeof UserSchemas.register>
export type UpdateProfileRequest = z.infer<typeof UserSchemas.updateProfile>
export type LoginRequest = z.infer<typeof UserSchemas.login>
```

### 動的バリデーション

```typescript
// app/lib/schemas/dynamic.ts
import { z } from 'zod'

// 条件付きバリデーション
export const createConditionalSchema = (userRole: 'admin' | 'user') => {
  const baseSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(10).max(10000),
    status: z.enum(['draft', 'published'])
  })

  if (userRole === 'admin') {
    // 管理者は追加フィールドを設定可能
    return baseSchema.extend({
      featured: z.boolean().optional(),
      priority: z.number().min(0).max(10).optional(),
      scheduledAt: z.string().datetime().optional(),
      seoSettings: z.object({
        metaTitle: z.string().max(60).optional(),
        metaDescription: z.string().max(160).optional(),
        keywords: z.array(z.string()).max(10).optional()
      }).optional()
    })
  }

  return baseSchema
}

// 配列の長さに応じた動的バリデーション
export const createBatchSchema = <T extends z.ZodType>(
  itemSchema: T,
  maxItems: number = 100
) => {
  return z.array(itemSchema)
    .min(1, '少なくとも1つの項目が必要です')
    .max(maxItems, `最大${maxItems}件まで処理できます`)
    .refine(
      (items) => {
        // 重複チェック（IDベース）
        const ids = items.map((item: any) => item.id).filter(Boolean)
        return new Set(ids).size === ids.length
      },
      { message: '重複するIDが含まれています' }
    )
}
```

## RPCクライアントの実装

### 型安全なクライアント生成

```typescript
// app/lib/rpc/client.ts
import type { PostsAPI } from './server'

// RPC応答の型定義
interface RPCSuccess<T> {
  success: true
  data: T
}

interface RPCError {
  success: false
  error: string
  details?: any[]
}

type RPCResponse<T> = RPCSuccess<T> | RPCError

// APIクライアント基底クラス
abstract class BaseRPCClient {
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`/api/rpc${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new RPCError(result.error, result.details)
    }

    return result.data
  }
}

export class RPCError extends Error {
  constructor(
    message: string,
    public details?: any[]
  ) {
    super(message)
    this.name = 'RPCError'
  }
}

// Posts用RPCクライアント
export class PostsRPCClient extends BaseRPCClient {
  async getList(params: {
    page?: number
    limit?: number
    tag?: string
    author?: string
    status?: 'draft' | 'published'
  } = {}) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value))
      }
    })

    const endpoint = `/posts?${searchParams.toString()}`
    return this.request<Post[]>(endpoint)
  }

  async getById(id: string) {
    return this.request<Post>(`/posts/${id}`)
  }

  async create(data: CreatePostRequest) {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async update(id: string, data: UpdatePostRequest) {
    return this.request<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async delete(id: string) {
    return this.request<{ message: string }>(`/posts/${id}`, {
      method: 'DELETE'
    })
  }
}

// グローバルクライアントインスタンス
export const rpcClient = {
  posts: new PostsRPCClient()
}
```

### React Hooks統合

```typescript
// app/lib/hooks/useRPC.ts
import { useState, useEffect, useCallback } from 'react'
import { rpcClient, RPCError } from '../rpc/client'

// 汎用RPC Hook
export function useRPC<T, P extends any[]>(
  rpcCall: (...args: P) => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (...args: P) => {
    try {
      setLoading(true)
      setError(null)
      const result = await rpcCall(...args)
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof RPCError
        ? err.message
        : 'An unexpected error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, deps)

  return {
    data,
    loading,
    error,
    execute,
    refetch: () => execute(...([] as any))
  }
}

// Posts専用フック
export function usePostsList(params: Parameters<typeof rpcClient.posts.getList>[0] = {}) {
  const { data, loading, error, execute, refetch } = useRPC(
    rpcClient.posts.getList,
    [params.page, params.limit, params.tag, params.author, params.status]
  )

  useEffect(() => {
    execute(params)
  }, [execute, params])

  return {
    posts: data || [],
    loading,
    error,
    refetch
  }
}

export function usePost(id: string) {
  const { data, loading, error, execute } = useRPC(
    rpcClient.posts.getById,
    [id]
  )

  useEffect(() => {
    if (id) {
      execute(id)
    }
  }, [execute, id])

  return {
    post: data,
    loading,
    error
  }
}

// ミューテーション専用フック
export function useCreatePost() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPost = async (data: CreatePostRequest) => {
    try {
      setLoading(true)
      setError(null)
      const result = await rpcClient.posts.create(data)
      return result
    } catch (err) {
      const errorMessage = err instanceof RPCError
        ? err.message
        : 'Failed to create post'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createPost,
    loading,
    error
  }
}
```

## バリデーションエラーの高度な処理

### フォームレベルでのエラー統合

```typescript
// app/lib/validation/form-handler.ts
import { z } from 'zod'

interface ValidationError {
  field: string
  message: string
  code: string
}

interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}

export class FormValidator<T extends z.ZodType> {
  constructor(private schema: T) {}

  validate(data: unknown): ValidationResult<z.infer<T>> {
    try {
      const validData = this.schema.parse(data)
      return {
        success: true,
        data: validData
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        }
      }

      return {
        success: false,
        errors: [{
          field: 'root',
          message: 'Validation failed',
          code: 'unknown'
        }]
      }
    }
  }

  validateField(data: unknown, fieldPath: string): ValidationResult<any> {
    try {
      const validData = this.schema.parse(data)
      return { success: true, data: validData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.filter(err =>
          err.path.join('.') === fieldPath
        )

        if (fieldErrors.length > 0) {
          return {
            success: false,
            errors: fieldErrors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        }
      }

      return { success: true }
    }
  }
}
```

### リアルタイムバリデーション付きフォーム

```typescript
// app/islands/forms/ValidatedPostForm.tsx
import { useState, useCallback } from 'react'
import { FormValidator } from '../../lib/validation/form-handler'
import { PostSchemas } from '../../lib/schemas/posts'
import { useCreatePost } from '../../lib/hooks/useRPC'

const postValidator = new FormValidator(PostSchemas.create)

export function ValidatedPostForm() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    status: 'draft' as const
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)

  const { createPost, loading, error } = useCreatePost()

  // フィールド単位のバリデーション
  const validateField = useCallback((fieldName: string, value: any) => {
    setIsValidating(true)

    // デバウンス処理
    setTimeout(() => {
      const testData = { ...formData, [fieldName]: value }
      const result = postValidator.validateField(testData, fieldName)

      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: result.errors?.[0]?.message || ''
      }))

      setIsValidating(false)
    }, 300)
  }, [formData])

  const updateField = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    validateField(fieldName, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // フォーム全体のバリデーション
    const validation = postValidator.validate(formData)

    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.errors?.forEach(error => {
        errors[error.field] = error.message
      })
      setFieldErrors(errors)
      return
    }

    try {
      const post = await createPost(validation.data)
      // 成功時の処理
      console.log('Post created:', post)
    } catch (err) {
      // エラーハンドリング
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          タイトル
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          className={`mt-1 block w-full rounded-md border ${
            fieldErrors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {fieldErrors.title && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
        )}
        {isValidating && (
          <p className="mt-1 text-sm text-gray-500">検証中...</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          本文
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => updateField('content', e.target.value)}
          rows={10}
          className={`mt-1 block w-full rounded-md border ${
            fieldErrors.content ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {fieldErrors.content && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.content}</p>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || isValidating}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '保存中...' : '投稿を作成'}
      </button>
    </form>
  )
}
```

## やってみよう！

RPC実装とzodバリデーションを実践してみましょう：

1. **完全なRPC API**
   - ユーザー管理システム
   - 投稿管理システム
   - コメント機能

2. **高度なバリデーション**
   - 条件付きバリデーション
   - カスタムバリデーター
   - リアルタイム検証

3. **クライアント統合**
   - React Hooks統合
   - エラーハンドリング
   - 型安全性の確保

## ポイント

- **RPCパターン**：関数呼び出しのような直感的なAPI設計
- **zodバリデーション**：スキーマファーストの型安全バリデーション
- **エラーハンドリング**：構造化されたエラー処理
- **リアルタイム検証**：ユーザー体験を向上させる即座のフィードバック
- **型安全性**：エンドツーエンドの型安全な通信

## 参考文献

- [Zod Documentation](https://zod.dev/)
- [RPC vs REST比較](https://aws.amazon.com/compare/the-difference-between-rpc-and-rest/)
- [Form Validation Best Practices](https://web.dev/sign-up-form-best-practices/)
- [TypeScript Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
