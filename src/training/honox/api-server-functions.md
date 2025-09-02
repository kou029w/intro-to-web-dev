---
created: 2025-09-03 12:30:00+09:00
---

# API定義とサーバー関数

HonoXでは、フロントエンドとバックエンドの境界が曖昧になり、同一プロジェクト内でAPIエンドポイントとページを同時に開発できます。Honoの強力なAPIルーティング機能を活用して、型安全でスケーラブルなAPI設計を学んでいきましょう。

## APIルートの基本

### シンプルなAPIエンドポイント

```typescript
// app/routes/api/hello.ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    message: 'Hello from HonoX API!',
    timestamp: new Date().toISOString()
  })
})

export default app
```

### RESTfulなCRUD API

```typescript
// app/routes/api/posts/index.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

// バリデーションスキーマ
const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  tags: z.array(z.string()).optional()
})

const UpdatePostSchema = CreatePostSchema.partial()

// 投稿一覧取得 GET /api/posts
app.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '10')
  const tag = c.req.query('tag')

  try {
    const posts = await getPostsWithPagination({ page, limit, tag })
    return c.json({
      data: posts,
      pagination: {
        page,
        limit,
        hasNext: posts.length === limit
      }
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch posts' }, 500)
  }
})

// 投稿作成 POST /api/posts
app.post('/', zValidator('json', CreatePostSchema), async (c) => {
  const postData = c.req.valid('json')
  
  try {
    const newPost = await createPost({
      ...postData,
      authorId: c.get('user')?.id,
      publishedAt: new Date().toISOString()
    })
    
    return c.json(newPost, 201)
  } catch (error) {
    return c.json({ error: 'Failed to create post' }, 500)
  }
})

export default app
```

### 動的パラメータを使ったAPI

```typescript
// app/routes/api/posts/[id].ts
import { Hono } from 'hono'

const app = new Hono()

// 特定の投稿取得 GET /api/posts/:id
app.get('/', async (c) => {
  const id = c.req.param('id')
  
  try {
    const post = await getPostById(id)
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }
    
    return c.json(post)
  } catch (error) {
    return c.json({ error: 'Failed to fetch post' }, 500)
  }
})

// 投稿更新 PUT /api/posts/:id
app.put('/', zValidator('json', UpdatePostSchema), async (c) => {
  const id = c.req.param('id')
  const updateData = c.req.valid('json')
  
  try {
    const updatedPost = await updatePost(id, {
      ...updateData,
      updatedAt: new Date().toISOString()
    })
    
    if (!updatedPost) {
      return c.json({ error: 'Post not found' }, 404)
    }
    
    return c.json(updatedPost)
  } catch (error) {
    return c.json({ error: 'Failed to update post' }, 500)
  }
})

// 投稿削除 DELETE /api/posts/:id
app.delete('/', async (c) => {
  const id = c.req.param('id')
  
  try {
    const deleted = await deletePost(id)
    
    if (!deleted) {
      return c.json({ error: 'Post not found' }, 404)
    }
    
    return c.json({ message: 'Post deleted successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to delete post' }, 500)
  }
})

export default app
```

「HonoXでは、ファイル名がそのままエンドポイントになるので、APIの構造が直感的ですね。」

## サーバー関数とデータ操作

### データベース操作の抽象化

```typescript
// app/lib/database/posts.ts
interface Post {
  id: string
  title: string
  content: string
  slug: string
  authorId: string
  publishedAt: string
  updatedAt: string
  tags: string[]
}

interface CreatePostData {
  title: string
  content: string
  authorId: string
  tags?: string[]
}

export class PostsService {
  // 投稿一覧取得（ページネーション付き）
  static async getPostsWithPagination({ 
    page = 1, 
    limit = 10, 
    tag 
  }: {
    page?: number
    limit?: number
    tag?: string
  }): Promise<Post[]> {
    const offset = (page - 1) * limit
    
    let query = `
      SELECT p.*, GROUP_CONCAT(t.name) as tags
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.published_at IS NOT NULL
    `
    
    const params: any[] = []
    
    if (tag) {
      query += ` AND t.name = ?`
      params.push(tag)
    }
    
    query += `
      GROUP BY p.id
      ORDER BY p.published_at DESC
      LIMIT ? OFFSET ?
    `
    params.push(limit, offset)
    
    const rows = await db.query(query, params)
    
    return rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }))
  }

  // 投稿作成
  static async createPost(data: CreatePostData): Promise<Post> {
    const id = crypto.randomUUID()
    const slug = generateSlug(data.title)
    const now = new Date().toISOString()
    
    await db.query(`
      INSERT INTO posts (id, title, content, slug, author_id, published_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, data.title, data.content, slug, data.authorId, now, now])
    
    // タグの関連付け
    if (data.tags && data.tags.length > 0) {
      await this.associateTags(id, data.tags)
    }
    
    return this.getPostById(id)!
  }

  // タグの関連付け
  private static async associateTags(postId: string, tags: string[]): Promise<void> {
    for (const tagName of tags) {
      // タグが存在しない場合は作成
      let [tag] = await db.query('SELECT id FROM tags WHERE name = ?', [tagName])
      
      if (!tag) {
        const tagId = crypto.randomUUID()
        await db.query('INSERT INTO tags (id, name) VALUES (?, ?)', [tagId, tagName])
        tag = { id: tagId }
      }
      
      // 投稿とタグを関連付け
      await db.query(
        'INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)',
        [postId, tag.id]
      )
    }
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}
```

### ファイルアップロードAPI

```typescript
// app/routes/api/upload.ts
import { Hono } from 'hono'

const app = new Hono()

app.post('/', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    // ファイル検証
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return c.json({ error: 'File too large' }, 400)
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type' }, 400)
    }
    
    // ファイル保存
    const fileName = `${crypto.randomUUID()}.${getFileExtension(file.name)}`
    const filePath = `uploads/${fileName}`
    
    // Cloudflare Workers環境での例
    if (c.env?.BUCKET) {
      await c.env.BUCKET.put(fileName, file.stream())
    } else {
      // ローカル環境での保存
      const buffer = await file.arrayBuffer()
      await saveFileLocally(filePath, buffer)
    }
    
    return c.json({
      fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: `/uploads/${fileName}`
    })
    
  } catch (error) {
    return c.json({ error: 'Upload failed' }, 500)
  }
})

function getFileExtension(filename: string): string {
  return filename.split('.').pop() || ''
}

export default app
```

## 認証とセキュリティ

### JWT認証API

```typescript
// app/routes/api/auth/login.ts
import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

const app = new Hono()

app.post('/', zValidator('json', LoginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  
  try {
    // ユーザー認証
    const user = await authenticateUser(email, password)
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // JWTトークン生成
    const token = await sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24時間
      },
      c.env?.JWT_SECRET || 'secret'
    )
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    })
    
  } catch (error) {
    return c.json({ error: 'Authentication failed' }, 500)
  }
})

async function authenticateUser(email: string, password: string) {
  const [user] = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  )
  
  if (!user) return null
  
  const isValid = await verifyPassword(password, user.password_hash)
  return isValid ? user : null
}

export default app
```

### 認証ミドルウェア

```typescript
// app/lib/middleware/auth.ts
import { Context, Next } from 'hono'
import { verify } from 'hono/jwt'

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  const token = authHeader.slice(7)
  
  try {
    const payload = await verify(token, c.env?.JWT_SECRET || 'secret')
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

## リアルタイム機能

### WebSocket実装

```typescript
// app/routes/api/chat/ws.ts
import { Hono } from 'hono'
import { upgradeWebSocket } from 'hono/ws'

const app = new Hono()

// WebSocket接続の管理
const connections = new Map<string, WebSocket>()

app.get(
  '/',
  upgradeWebSocket((c) => {
    return {
      onOpen(event, ws) {
        const userId = c.get('user')?.id
        if (userId) {
          connections.set(userId, ws)
          console.log(`User ${userId} connected`)
        }
      },
      
      onMessage(event, ws) {
        const data = JSON.parse(event.data.toString())
        
        switch (data.type) {
          case 'chat_message':
            broadcastMessage(data)
            break
          case 'typing':
            broadcastTyping(data)
            break
        }
      },
      
      onClose(event, ws) {
        const userId = findUserByWebSocket(ws)
        if (userId) {
          connections.delete(userId)
          console.log(`User ${userId} disconnected`)
        }
      }
    }
  })
)

function broadcastMessage(message: any) {
  const payload = JSON.stringify({
    type: 'new_message',
    data: message
  })
  
  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload)
    }
  })
}

export default app
```

## データ検証とエラーハンドリング

### 包括的なバリデーション

```typescript
// app/lib/validation/posts.ts
import { z } from 'zod'

export const PostValidation = {
  create: z.object({
    title: z.string()
      .min(1, 'タイトルは必須です')
      .max(200, 'タイトルは200文字以内で入力してください'),
    content: z.string()
      .min(10, '本文は10文字以上で入力してください')
      .max(10000, '本文は10,000文字以内で入力してください'),
    excerpt: z.string()
      .max(500, '抜粋は500文字以内で入力してください')
      .optional(),
    tags: z.array(z.string().max(50))
      .max(10, 'タグは10個まで追加できます')
      .optional(),
    publishedAt: z.string().datetime().optional(),
    status: z.enum(['draft', 'published']).default('draft')
  }),
  
  update: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(10).max(10000).optional(),
    excerpt: z.string().max(500).optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    status: z.enum(['draft', 'published']).optional()
  }),
  
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    tag: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
    author: z.string().optional()
  })
}
```

### エラーレスポンスの統一

```typescript
// app/lib/errors/api.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export const createErrorResponse = (error: any, c: Context) => {
  if (error instanceof APIError) {
    return c.json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      },
      timestamp: new Date().toISOString()
    }, error.statusCode)
  }
  
  // 未処理のエラー
  console.error('Unhandled error:', error)
  return c.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    },
    timestamp: new Date().toISOString()
  }, 500)
}
```

## パフォーマンス最適化

### キャッシング戦略

```typescript
// app/routes/api/posts/index.ts
import { cache } from 'hono/cache'

const app = new Hono()

// レスポンスキャッシュ
app.get(
  '/',
  cache({
    cacheName: 'posts-api',
    cacheControl: 'max-age=300' // 5分間キャッシュ
  }),
  async (c) => {
    const posts = await PostsService.getPostsWithPagination({})
    return c.json(posts)
  }
)
```

### データベースクエリ最適化

```typescript
// app/lib/database/optimized-queries.ts
export class OptimizedPostsService {
  // N+1問題を解決するバッチローディング
  static async getPostsWithAuthors(postIds: string[]) {
    const posts = await db.query(`
      SELECT 
        p.*,
        u.id as author_id,
        u.name as author_name,
        u.avatar as author_avatar
      FROM posts p
      INNER JOIN users u ON p.author_id = u.id
      WHERE p.id IN (${postIds.map(() => '?').join(',')})
    `, postIds)
    
    return posts
  }
  
  // インデックスを活用した高速検索
  static async searchPosts(query: string, limit = 20) {
    return await db.query(`
      SELECT p.*, 
             MATCH(p.title, p.content) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM posts p
      WHERE MATCH(p.title, p.content) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY relevance DESC
      LIMIT ?
    `, [query, query, limit])
  }
}
```

## やってみよう！

HonoXでAPI開発を実践してみましょう：

1. **ブログAPI**
   - 投稿のCRUD操作
   - タグ機能
   - 検索機能

2. **認証システム**
   - ユーザー登録・ログイン
   - JWT認証
   - 権限管理

3. **ファイルアップロード**
   - 画像アップロード
   - ファイル検証
   - サムネイル生成

## ポイント

- **ファイルベースAPI**：直感的なエンドポイント設計
- **型安全性**：zodによるバリデーションとTypeScript統合
- **Honoエコシステム**：豊富なミドルウェアとユーティリティ
- **パフォーマンス**：効率的なキャッシングとクエリ最適化
- **セキュリティ**：認証・認可・入力検証の徹底

## 参考文献

- [Hono API Documentation](https://hono.dev/api)
- [Zod Validation](https://zod.dev/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [RESTful API Design](https://restfulapi.net/)
