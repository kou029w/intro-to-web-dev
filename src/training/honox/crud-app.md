# CRUD アプリケーション構築

HonoXでの学習の集大成として、実際のCRUD（Create、Read、Update、Delete）アプリケーションを構築してみましょう。ここまで学んだSSR、CSR、型安全性、バリデーション等の知識を組み合わせて、実用的なブログ管理システムを作成します。

## プロジェクト概要

### 構築するアプリケーション

**ブログ管理システム**
- 記事の作成・編集・削除・公開
- タグ管理機能
- 著者管理
- コメント機能
- 管理画面

### 技術スタック

```typescript
{
  "framework": "HonoX",
  "runtime": "Node.js / Cloudflare Workers",
  "database": "SQLite / PostgreSQL",
  "validation": "Zod",
  "styling": "Tailwind CSS",
  "authentication": "JWT",
  "testing": "Vitest"
}
```

## データベース設計

### スキーマ定義

```sql
-- データベーススキーマ
-- schema.sql

-- ユーザー（著者）
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 投稿
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id TEXT NOT NULL REFERENCES users(id),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- タグ
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TEXT NOT NULL
);

-- 投稿とタグの関連
CREATE TABLE post_tags (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- コメント
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL
);

-- インデックス
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_status ON comments(status);
```

### データベース操作クラス

```typescript
// app/lib/database/connection.ts
import Database from 'better-sqlite3'

class DatabaseManager {
  private static instance: DatabaseManager
  private db: Database.Database

  private constructor() {
    this.db = new Database(process.env.DATABASE_PATH || './blog.db')
    this.initializeSchema()
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  private initializeSchema() {
    // スキーマファイルを読み込んで実行
    const schema = readFileSync('./schema.sql', 'utf-8')
    this.db.exec(schema)
  }

  getDb(): Database.Database {
    return this.db
  }

  query(sql: string, params: any[] = []): any[] {
    try {
      const stmt = this.db.prepare(sql)
      return stmt.all(...params)
    } catch (error) {
      console.error('Database query error:', error)
      throw error
    }
  }

  run(sql: string, params: any[] = []): Database.RunResult {
    try {
      const stmt = this.db.prepare(sql)
      return stmt.run(...params)
    } catch (error) {
      console.error('Database run error:', error)
      throw error
    }
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)()
  }
}

export const db = DatabaseManager.getInstance()
```

## モデル層の実装

### Post モデル

```typescript
// app/lib/models/Post.ts
import { db } from '../database/connection'
import { z } from 'zod'

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  status: 'draft' | 'published'
  authorId: string
  author?: User
  tags?: Tag[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePostData {
  title: string
  content: string
  excerpt?: string
  status?: 'draft' | 'published'
  authorId: string
  tags?: string[]
}

export class PostModel {
  // 投稿一覧取得
  static async getList(options: {
    page?: number
    limit?: number
    status?: 'draft' | 'published'
    authorId?: string
    tag?: string
  } = {}): Promise<{ posts: Post[], total: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      authorId,
      tag
    } = options

    let whereClause = '1=1'
    const params: any[] = []

    if (status) {
      whereClause += ' AND p.status = ?'
      params.push(status)
    }

    if (authorId) {
      whereClause += ' AND p.author_id = ?'
      params.push(authorId)
    }

    if (tag) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM post_tags pt
        JOIN tags t ON pt.tag_id = t.id
        WHERE pt.post_id = p.id AND t.slug = ?
      )`
      params.push(tag)
    }

    // 総数取得
    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      WHERE ${whereClause}
    `
    const [countResult] = db.query(countQuery, params)
    const total = countResult.total

    // データ取得
    const offset = (page - 1) * limit
    const dataQuery = `
      SELECT
        p.*,
        u.name as author_name,
        u.avatar_url as author_avatar
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE ${whereClause}
      ORDER BY
        CASE WHEN p.published_at IS NOT NULL THEN p.published_at ELSE p.created_at END DESC
      LIMIT ? OFFSET ?
    `

    const posts = db.query(dataQuery, [...params, limit, offset])

    // タグ情報を別途取得
    const postsWithTags = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        tags: await this.getPostTags(post.id)
      }))
    )

    return { posts: postsWithTags, total }
  }

  // 投稿詳細取得
  static async getById(id: string): Promise<Post | null> {
    const query = `
      SELECT
        p.*,
        u.name as author_name,
        u.email as author_email,
        u.avatar_url as author_avatar,
        u.bio as author_bio
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `

    const [post] = db.query(query, [id])
    if (!post) return null

    const tags = await this.getPostTags(id)
    return { ...post, tags }
  }

  // スラッグで取得
  static async getBySlug(slug: string): Promise<Post | null> {
    const query = `
      SELECT
        p.*,
        u.name as author_name,
        u.avatar_url as author_avatar
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = ? AND p.status = 'published'
    `

    const [post] = db.query(query, [slug])
    if (!post) return null

    const tags = await this.getPostTags(post.id)
    return { ...post, tags }
  }

  // 投稿作成
  static async create(data: CreatePostData): Promise<Post> {
    const id = crypto.randomUUID()
    const slug = this.generateSlug(data.title)
    const now = new Date().toISOString()
    const publishedAt = data.status === 'published' ? now : null

    return db.transaction(() => {
      // 投稿を作成
      db.run(`
        INSERT INTO posts (id, title, slug, content, excerpt, status, author_id, published_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, data.title, slug, data.content, data.excerpt || null,
        data.status || 'draft', data.authorId, publishedAt, now, now
      ])

      // タグを関連付け
      if (data.tags && data.tags.length > 0) {
        this.associateTags(id, data.tags)
      }

      return this.getById(id)!
    })
  }

  // 投稿更新
  static async update(id: string, data: Partial<CreatePostData>, userId: string): Promise<Post | null> {
    // 権限チェック
    const [existingPost] = db.query('SELECT author_id FROM posts WHERE id = ?', [id])
    if (!existingPost || existingPost.author_id !== userId) {
      return null
    }

    const now = new Date().toISOString()
    const updates: string[] = []
    const params: any[] = []

    if (data.title) {
      updates.push('title = ?', 'slug = ?')
      params.push(data.title, this.generateSlug(data.title))
    }

    if (data.content !== undefined) {
      updates.push('content = ?')
      params.push(data.content)
    }

    if (data.excerpt !== undefined) {
      updates.push('excerpt = ?')
      params.push(data.excerpt)
    }

    if (data.status) {
      updates.push('status = ?')
      params.push(data.status)

      if (data.status === 'published' && !existingPost.published_at) {
        updates.push('published_at = ?')
        params.push(now)
      }
    }

    updates.push('updated_at = ?')
    params.push(now, id)

    return db.transaction(() => {
      // 投稿を更新
      if (updates.length > 1) {
        db.run(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`, params)
      }

      // タグを更新
      if (data.tags !== undefined) {
        // 既存のタグ関連を削除
        db.run('DELETE FROM post_tags WHERE post_id = ?', [id])

        // 新しいタグを関連付け
        if (data.tags.length > 0) {
          this.associateTags(id, data.tags)
        }
      }

      return this.getById(id)
    })
  }

  // 投稿削除
  static async delete(id: string, userId: string): Promise<boolean> {
    // 権限チェック
    const [existingPost] = db.query('SELECT author_id FROM posts WHERE id = ?', [id])
    if (!existingPost || existingPost.author_id !== userId) {
      return false
    }

    const result = db.run('DELETE FROM posts WHERE id = ?', [id])
    return result.changes > 0
  }

  // スラッグ生成
  private static generateSlug(title: string): string {
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // 重複チェック
    let slug = baseSlug
    let counter = 1

    while (true) {
      const [existing] = db.query('SELECT id FROM posts WHERE slug = ?', [slug])
      if (!existing) break

      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  // タグの関連付け
  private static associateTags(postId: string, tagNames: string[]) {
    for (const tagName of tagNames) {
      // タグが存在するか確認、なければ作成
      let [tag] = db.query('SELECT id FROM tags WHERE name = ?', [tagName])

      if (!tag) {
        const tagId = crypto.randomUUID()
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-')

        db.run(`
          INSERT INTO tags (id, name, slug, created_at)
          VALUES (?, ?, ?, ?)
        `, [tagId, tagName, tagSlug, new Date().toISOString()])

        tag = { id: tagId }
      }

      // 投稿とタグを関連付け
      db.run(`
        INSERT OR IGNORE INTO post_tags (post_id, tag_id)
        VALUES (?, ?)
      `, [postId, tag.id])
    }
  }

  // 投稿のタグ取得
  private static async getPostTags(postId: string): Promise<Tag[]> {
    return db.query(`
      SELECT t.id, t.name, t.slug, t.color
      FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
      ORDER BY t.name
    `, [postId])
  }
}
```

## API層の実装

### Posts API

```typescript
// app/routes/api/posts/index.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { PostModel } from '../../../lib/models/Post'
import { PostSchemas } from '../../../lib/schemas/posts'
import { authMiddleware } from '../../../lib/middleware/auth'

const app = new Hono()

// 投稿一覧取得
app.get('/', zValidator('query', PostSchemas.listQuery), async (c) => {
  const query = c.req.valid('query')

  try {
    const { posts, total } = await PostModel.getList(query)

    return c.json({
      success: true,
      data: posts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit)
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch posts'
    }, 500)
  }
})

// 投稿作成
app.post('/',
  authMiddleware,
  zValidator('json', PostSchemas.create),
  async (c) => {
    const postData = c.req.valid('json')
    const user = c.get('user')

    try {
      const post = await PostModel.create({
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

export default app

// app/routes/api/posts/[id].ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { PostModel } from '../../../lib/models/Post'
import { PostSchemas } from '../../../lib/schemas/posts'
import { authMiddleware } from '../../../lib/middleware/auth'

const app = new Hono()

// 投稿取得
app.get('/', async (c) => {
  const id = c.req.param('id')

  try {
    const post = await PostModel.getById(id)

    if (!post) {
      return c.json({
        success: false,
        error: 'Post not found'
      }, 404)
    }

    return c.json({
      success: true,
      data: post
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch post'
    }, 500)
  }
})

// 投稿更新
app.put('/',
  authMiddleware,
  zValidator('json', PostSchemas.update),
  async (c) => {
    const id = c.req.param('id')
    const updateData = c.req.valid('json')
    const user = c.get('user')

    try {
      const post = await PostModel.update(id, updateData, user.id)

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
app.delete('/', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')

  try {
    const success = await PostModel.delete(id, user.id)

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

export default app
```

## フロントエンド実装

### 投稿一覧ページ

```typescript
// app/routes/blog/index.tsx
import { PostCard } from '../../components/blog/PostCard'
import { Pagination } from '../../components/ui/Pagination'

interface BlogIndexProps {
  page?: string
  tag?: string
}

export default async function BlogIndex({ page = '1', tag }: BlogIndexProps) {
  const currentPage = parseInt(page)
  const limit = 12

  // サーバーサイドでデータ取得
  const { posts, pagination } = await getPostsWithPagination({
    page: currentPage,
    limit,
    tag,
    status: 'published'
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {tag ? `タグ: ${tag}` : 'ブログ'}
        </h1>
        <p className="text-lg text-gray-600">
          Web開発とテクノロジーについての記事を書いています
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">記事が見つかりませんでした。</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            basePath={tag ? `/blog?tag=${tag}` : '/blog'}
          />
        </>
      )}
    </div>
  )
}

async function getPostsWithPagination(params: any) {
  // 実際のデータフェッチング実装
  const { posts, total } = await PostModel.getList(params)

  return {
    posts,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit)
    }
  }
}
```

### 投稿詳細ページ

```typescript
// app/routes/blog/[slug].tsx
import { CommentSection } from '../../islands/blog/CommentSection'
import { ShareButtons } from '../../islands/blog/ShareButtons'
import { RelatedPosts } from '../../islands/blog/RelatedPosts'

interface BlogPostProps {
  slug: string
}

export default async function BlogPost({ slug }: BlogPostProps) {
  // サーバーサイドで投稿を取得
  const post = await PostModel.getBySlug(slug)

  if (!post) {
    return <BlogPostNotFound />
  }

  // 関連投稿も取得
  const relatedPosts = await getRelatedPosts(post.id, post.tags?.map(t => t.id) || [])

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* SEOメタ情報 */}
      <title>{post.title} | My Blog</title>
      <meta name="description" content={post.excerpt || ''} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt || ''} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`https://myblog.com/blog/${slug}`} />

      {/* 記事ヘッダー */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <div className="flex items-center text-gray-600 text-sm mb-6">
          <img
            src={post.author.avatar_url || '/default-avatar.png'}
            alt={post.author_name}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="font-medium">{post.author_name}</p>
            <time dateTime={post.published_at}>
              {formatDate(post.published_at)}
            </time>
          </div>
        </div>

        {/* タグ */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <a
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
              >
                {tag.name}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* 記事本文 */}
      <div className="prose prose-lg max-w-none mb-12">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      {/* ソーシャル共有ボタン（アイランド） */}
      <div className="border-t border-b py-8 mb-12">
        <ShareButtons
          title={post.title}
          url={`https://myblog.com/blog/${slug}`}
          text={post.excerpt}
        />
      </div>

      {/* 関連記事（アイランド） */}
      <section className="mb-12">
        <RelatedPosts
          currentPostId={post.id}
          initialData={relatedPosts}
        />
      </section>

      {/* コメント（アイランド） */}
      <section>
        <CommentSection postId={post.id} />
      </section>
    </article>
  )
}

function BlogPostNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">記事が見つかりません</h1>
      <p className="text-gray-600 mb-8">
        指定された記事は存在しないか、削除された可能性があります。
      </p>
      <a
        href="/blog"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        ブログ一覧に戻る
      </a>
    </div>
  )
}
```

### 管理画面

```typescript
// app/routes/admin/posts/index.tsx
import { PostsTable } from '../../../islands/admin/PostsTable'
import { requireAuth } from '../../../lib/middleware/auth'

export default function AdminPosts() {
  // 管理者権限をチェック（ミドルウェア）
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">投稿管理</h1>
        <a
          href="/admin/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          新規投稿
        </a>
      </div>

      <PostsTable />
    </div>
  )
}

// app/routes/admin/posts/new.tsx
import { PostForm } from '../../../islands/admin/PostForm'

export default function NewPost() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">新規投稿</h1>
        <p className="text-gray-600 mt-2">新しいブログ投稿を作成します</p>
      </div>

      <PostForm
        mode="create"
        onSuccess={(post) => {
          window.location.href = `/admin/posts/${post.id}`
        }}
      />
    </div>
  )
}
```

## インタラクティブコンポーネント（アイランド）

### 投稿フォーム

```typescript
// app/islands/admin/PostForm.tsx
import { useState } from 'react'
import { useCreatePost, useUpdatePost } from '../../lib/hooks/usePostMutations'
import type { Post, CreatePostRequest } from '../../lib/api/types'

interface PostFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<Post>
  onSuccess?: (post: Post) => void
}

export function PostForm({ mode, initialData, onSuccess }: PostFormProps) {
  const [formData, setFormData] = useState<CreatePostRequest>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    status: initialData?.status || 'draft',
    tags: initialData?.tags?.map(t => t.name) || []
  })

  const [tagInput, setTagInput] = useState('')
  const { createPost, loading: createLoading, error: createError } = useCreatePost()
  const { updatePost, loading: updateLoading, error: updateError } = useUpdatePost()

  const loading = createLoading || updateLoading
  const error = createError || updateError

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let post: Post

      if (mode === 'create') {
        post = await createPost(formData)
      } else {
        post = await updatePost(initialData!.id!, formData)
      }

      if (post && onSuccess) {
        onSuccess(post)
      }
    } catch (err) {
      // エラーハンドリングは各フックで行う
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          タイトル
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          本文
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          rows={20}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          抜粋
        </label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          タグ
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="タグを入力"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            追加
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.tags?.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ステータス
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            status: e.target.value as 'draft' | 'published'
          }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="draft">下書き</option>
          <option value="published">公開</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? '保存中...' : mode === 'create' ? '投稿を作成' : '投稿を更新'}
        </button>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
```

## やってみよう！

完全なCRUDアプリケーションを構築してみましょう：

1. **データベース設計**
   - 適切な正規化
   - インデックス設定
   - 制約の定義

2. **API実装**
   - RESTful設計
   - バリデーション
   - エラーハンドリング

3. **フロントエンド実装**
   - SSRによる高速表示
   - インタラクティブな管理機能
   - レスポンシブデザイン

4. **セキュリティ**
   - 認証・認可
   - XSS対策
   - CSRF対策

## ポイント

- **フルスタック開発**：フロントエンドからバックエンドまで一貫した開発体験
- **型安全性**：データベースからUIまでエンドツーエンドの型安全性
- **パフォーマンス**：SSRとアイランドアーキテクチャによる最適化
- **保守性**：適切な分離とモジュール化による可読性の向上
- **スケーラビリティ**：成長に対応できる柔軟なアーキテクチャ

## 参考文献

- [Database Design Best Practices](https://www.guru99.com/database-design.html)
- [RESTful API Design](https://restfulapi.net/)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Security Checklist](https://web.dev/security/)
