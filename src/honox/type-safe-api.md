# 型安全なAPI連携

HonoXの最大の魅力の一つは、フロントエンドとバックエンドの境界を超えた型安全性です。TypeScriptの強力な型システムを活用して、APIの呼び出しから応答まで、完全に型安全なアプリケーションを構築する方法について学んでいきましょう。

## 型安全APIクライアントの基礎

### APIクライアントの型定義

```typescript
// app/lib/api/types.ts
// API全体の型定義を一元管理

// 共通レスポンス型
export interface ApiResponse<T> {
  data: T
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
  }
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any[]
  }
  timestamp: string
}

// エンティティ型
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  authorId: string
  author: User
  tags: string[]
  status: 'draft' | 'published'
  publishedAt: string
  createdAt: string
  updatedAt: string
}

// リクエスト型
export interface CreatePostRequest {
  title: string
  content: string
  excerpt?: string
  tags?: string[]
  status?: 'draft' | 'published'
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  excerpt?: string
  tags?: string[]
  status?: 'draft' | 'published'
}
```

### 型安全なAPIクライアント

```typescript
// app/lib/api/client.ts
import type {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  Post,
  CreatePostRequest,
  UpdatePostRequest
} from './types'

class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any[]
  ) {
    super(message)
    this.name = 'APIError'
  }
}

class APIClient {
  private baseUrl: string
  private token?: string

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  setAuthToken(token: string) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error: ErrorResponse = await response.json()
      throw new APIError(
        response.status,
        error.error.code,
        error.error.message,
        error.error.details
      )
    }

    return response.json()
  }

  // Posts API
  async getPosts(params?: {
    page?: number
    limit?: number
    tag?: string
    author?: string
  }): Promise<PaginatedResponse<Post>> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.tag) searchParams.set('tag', params.tag)
    if (params?.author) searchParams.set('author', params.author)

    const endpoint = `/posts${searchParams.toString() ? `?${searchParams}` : ''}`
    return this.request<PaginatedResponse<Post>>(endpoint)
  }

  async getPost(id: string): Promise<ApiResponse<Post>> {
    return this.request<ApiResponse<Post>>(`/posts/${id}`)
  }

  async createPost(data: CreatePostRequest): Promise<ApiResponse<Post>> {
    return this.request<ApiResponse<Post>>('/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePost(id: string, data: UpdatePostRequest): Promise<ApiResponse<Post>> {
    return this.request<ApiResponse<Post>>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deletePost(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(`/posts/${id}`, {
      method: 'DELETE'
    })
  }
}

export const apiClient = new APIClient()
```

「型安全なAPIクライアントを使うことで、呼び出し時点でタイプミスや型の不一致を防げます。」

## HonoRPCパターンの活用

### RPC風のAPI設計

```typescript
// app/lib/api/rpc.ts
import type { Context } from 'hono'
import type { Post, CreatePostRequest } from './types'

// サーバー側のハンドラー定義
export const postsHandlers = {
  list: async (c: Context) => {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')

    const posts = await getPostsWithPagination({ page, limit })
    return c.json({
      data: posts,
      pagination: { page, limit, hasNext: posts.length === limit }
    })
  },

  get: async (c: Context) => {
    const id = c.req.param('id')
    const post = await getPostById(id)

    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }

    return c.json({ data: post })
  },

  create: async (c: Context) => {
    const postData = await c.req.json<CreatePostRequest>()
    const post = await createPost(postData)
    return c.json({ data: post }, 201)
  }
}

// 型推論のためのヘルパー型
export type PostsAPI = {
  [K in keyof typeof postsHandlers]: typeof postsHandlers[K]
}
```

### クライアント側での型安全な呼び出し

```typescript
// app/lib/api/posts-client.ts
import type { PostsAPI } from './rpc'

type ExtractResponseType<T> = T extends (c: any) => Promise<Response>
  ? T extends (c: any) => Promise<infer R>
    ? R extends Response
      ? any // Response型から実際の戻り値型を抽出
      : never
    : never
  : never

class PostsClient {
  async list(params: { page?: number; limit?: number } = {}) {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())

    const response = await fetch(`/api/posts?${searchParams}`)
    return response.json()
  }

  async get(id: string) {
    const response = await fetch(`/api/posts/${id}`)
    return response.json()
  }

  async create(data: CreatePostRequest) {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}

export const postsClient = new PostsClient()
```

## React Hooks との統合

### カスタムAPIフック

```typescript
// app/lib/hooks/usePosts.ts
import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import type { Post, PaginatedResponse } from '../api/types'

export function usePosts(params?: {
  page?: number
  limit?: number
  tag?: string
}) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    hasNext: false
  })

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.getPosts(params)

        setPosts(response.data)
        setPagination(response.pagination)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to fetch posts')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [params?.page, params?.limit, params?.tag])

  return {
    posts,
    loading,
    error,
    pagination,
    refetch: () => fetchPosts()
  }
}

export function usePost(id: string) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.getPost(id)
        setPost(response.data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to fetch post')
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPost()
    }
  }, [id])

  return { post, loading, error }
}
```

### ミューテーション用フック

```typescript
// app/lib/hooks/usePostMutations.ts
import { useState } from 'react'
import { apiClient } from '../api/client'
import type { CreatePostRequest, UpdatePostRequest, Post } from '../api/types'

export function useCreatePost() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPost = async (data: CreatePostRequest): Promise<Post | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.createPost(data)
      return response.data
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create post')
      }
      return null
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

export function useUpdatePost() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updatePost = async (id: string, data: UpdatePostRequest): Promise<Post | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.updatePost(id, data)
      return response.data
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to update post')
      }
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    updatePost,
    loading,
    error
  }
}
```

## フォームとの型安全な統合

### 型安全なフォーム実装

```typescript
// app/islands/forms/PostForm.tsx
import { useState } from 'react'
import { useCreatePost } from '../../lib/hooks/usePostMutations'
import type { CreatePostRequest } from '../../lib/api/types'

interface PostFormProps {
  onSuccess?: (post: Post) => void
  initialData?: Partial<CreatePostRequest>
}

export function PostForm({ onSuccess, initialData }: PostFormProps) {
  const [formData, setFormData] = useState<CreatePostRequest>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    tags: initialData?.tags || [],
    status: initialData?.status || 'draft'
  })

  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof CreatePostRequest, string>>
  >({})

  const { createPost, loading, error } = useCreatePost()

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreatePostRequest, string>> = {}

    if (!formData.title.trim()) {
      errors.title = 'タイトルは必須です'
    } else if (formData.title.length > 200) {
      errors.title = 'タイトルは200文字以内で入力してください'
    }

    if (!formData.content.trim()) {
      errors.content = '本文は必須です'
    } else if (formData.content.length < 10) {
      errors.content = '本文は10文字以上で入力してください'
    }

    if (formData.tags && formData.tags.length > 10) {
      errors.tags = 'タグは10個まで追加できます'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const post = await createPost(formData)
    if (post && onSuccess) {
      onSuccess(post)
    }
  }

  const updateField = <K extends keyof CreatePostRequest>(
    field: K,
    value: CreatePostRequest[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // バリデーションエラーをクリア
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          タイトル
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
            validationErrors.title ? 'border-red-500' : ''
          }`}
        />
        {validationErrors.title && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          本文
        </label>
        <textarea
          id="content"
          rows={10}
          value={formData.content}
          onChange={(e) => updateField('content', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
            validationErrors.content ? 'border-red-500' : ''
          }`}
        />
        {validationErrors.content && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.content}</p>
        )}
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
          抜粋（任意）
        </label>
        <textarea
          id="excerpt"
          rows={3}
          value={formData.excerpt}
          onChange={(e) => updateField('excerpt', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          ステータス
        </label>
        <select
          value={formData.status}
          onChange={(e) => updateField('status', e.target.value as 'draft' | 'published')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="draft">下書き</option>
          <option value="published">公開</option>
        </select>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? '保存中...' : '投稿を保存'}
      </button>
    </form>
  )
}
```

## リアルタイム通信での型安全性

### WebSocketクライアントの型安全実装

```typescript
// app/lib/websocket/types.ts
export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp: string
}

export interface ChatMessage {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: string
}

export type WebSocketMessageMap = {
  'chat_message': ChatMessage
  'user_joined': { userId: string; userName: string }
  'user_left': { userId: string; userName: string }
  'typing': { userId: string; userName: string; isTyping: boolean }
}

// app/lib/websocket/client.ts
export class TypeSafeWebSocketClient {
  private ws: WebSocket | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  connect(url: string) {
    this.ws = new WebSocket(url)

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach(listener => listener(message.data))
    }
  }

  on<K extends keyof WebSocketMessageMap>(
    type: K,
    listener: (data: WebSocketMessageMap[K]) => void
  ) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(listener)
  }

  off<K extends keyof WebSocketMessageMap>(
    type: K,
    listener: (data: WebSocketMessageMap[K]) => void
  ) {
    const listeners = this.listeners.get(type)
    if (listeners) {
      listeners.delete(listener)
    }
  }

  send<K extends keyof WebSocketMessageMap>(
    type: K,
    data: WebSocketMessageMap[K]
  ) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage<WebSocketMessageMap[K]> = {
        type,
        data,
        timestamp: new Date().toISOString()
      }
      this.ws.send(JSON.stringify(message))
    }
  }
}
```

## エラーハンドリングの型安全性

### 型安全なエラー処理

```typescript
// app/lib/errors/types.ts
export type APIErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'

export interface APIErrorDetails {
  field?: string
  message: string
  code?: string
}

export class TypedAPIError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: APIErrorCode,
    message: string,
    public readonly details?: APIErrorDetails[]
  ) {
    super(message)
    this.name = 'TypedAPIError'
  }

  isValidationError(): this is TypedAPIError & { code: 'VALIDATION_ERROR' } {
    return this.code === 'VALIDATION_ERROR'
  }

  isNotFoundError(): this is TypedAPIError & { code: 'NOT_FOUND' } {
    return this.code === 'NOT_FOUND'
  }

  isUnauthorizedError(): this is TypedAPIError & { code: 'UNAUTHORIZED' } {
    return this.code === 'UNAUTHORIZED'
  }
}

// app/lib/hooks/useErrorHandler.ts
export function useErrorHandler() {
  const handleError = (error: unknown) => {
    if (error instanceof TypedAPIError) {
      if (error.isValidationError()) {
        // バリデーションエラーの場合の処理
        return {
          type: 'validation',
          message: error.message,
          details: error.details
        }
      } else if (error.isUnauthorizedError()) {
        // 認証エラーの場合の処理
        return {
          type: 'auth',
          message: '認証が必要です'
        }
      } else if (error.isNotFoundError()) {
        // 404エラーの場合の処理
        return {
          type: 'not_found',
          message: 'リソースが見つかりません'
        }
      }
    }

    // その他のエラー
    return {
      type: 'unknown',
      message: '予期しないエラーが発生しました'
    }
  }

  return { handleError }
}
```

## やってみよう！

型安全なAPI連携を実践してみましょう：

1. **完全型安全なCRUD操作**
   - 型定義からクライアント作成
   - React Hooks統合
   - エラーハンドリング

2. **リアルタイム機能**
   - WebSocket通信の型安全実装
   - メッセージ型の管理

3. **フォーム統合**
   - バリデーション付きフォーム
   - 型安全な入力処理

## ポイント

- **エンドツーエンド型安全性**：APIからUIまで一貫した型定義
- **開発時エラー検出**：コンパイル時の型チェックでバグを防止
- **自動補完**：IDEでの強力な開発支援
- **リファクタリング安全性**：型に基づく安全な変更
- **ドキュメント効果**：型定義が仕様書の役割を果たす

## 参考文献

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Zod Documentation](https://zod.dev/)
- [Hono TypeScript Support](https://hono.dev/getting-started/basic)
