---
created: 2025-09-03 12:30:00+09:00
---

# フロントエンドページ開発

HonoXでのフロントエンドページ開発は、従来のReactアプリケーション開発と似ている部分もありますが、SSR（サーバーサイドレンダリング）とアイランドアーキテクチャの恩恵を最大限活用できる点が大きく異なります。実際のページを作りながら学んでいきましょう。

## 基本的なページの作成

### シンプルなページの実装

```typescript
// app/routes/about.tsx
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">私たちについて</h1>
      <p className="text-lg leading-relaxed mb-4">
        このサイトは、HonoXを使って構築されたモダンなWebアプリケーションです。
      </p>
      <p className="text-gray-600">
        高速なSSRと効率的なアイランドアーキテクチャにより、
        優れたユーザー体験を提供します。
      </p>
    </div>
  )
}
```

「このページは完全にサーバーサイドでレンダリングされ、JavaScriptなしでも表示されます。」

### メタデータの設定

```typescript
// app/routes/about.tsx
export default function AboutPage() {
  return (
    <div>
      <title>私たちについて - My HonoX App</title>
      <meta name="description" content="HonoXで構築されたモダンなWebアプリケーションについて" />
      
      <div className="container mx-auto px-4 py-8">
        <h1>私たちについて</h1>
        {/* コンテンツ */}
      </div>
    </div>
  )
}
```

## レンダラーとレイアウトシステム

### グローバルレンダラーの設定

```typescript
// app/routes/_renderer.tsx
import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, title, description }) => {
  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'My HonoX App'}</title>
        <meta 
          name="description" 
          content={description || 'HonoXで構築された高速なWebアプリケーション'} 
        />
        
        {/* CSS フレームワークの読み込み */}
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        <style dangerouslySetInnerHTML={{
          __html: `
            body { 
              font-family: 'Inter', sans-serif; 
            }
          `
        }} />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
})
```

### セクション別レイアウト

```typescript
// app/routes/blog/_layout.tsx
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'

export default function BlogLayout({ children }: { children: any }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Blog"
        navigation={[
          { href: '/', label: 'ホーム' },
          { href: '/blog', label: 'ブログ', current: true },
          { href: '/about', label: 'About' },
        ]}
      />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
```

## 動的ルートとデータフェッチ

### パラメータを使った動的ページ

```typescript
// app/routes/blog/[slug].tsx
interface BlogPostProps {
  slug: string
}

export default function BlogPost({ slug }: BlogPostProps) {
  // サーバーサイドでデータを取得（SSR）
  const post = getPostBySlug(slug)
  
  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">記事が見つかりません</h1>
        <p className="mt-2 text-gray-600">指定された記事は存在しないか、削除された可能性があります。</p>
        <a href="/blog" className="mt-4 inline-block text-blue-600 hover:underline">
          ブログ一覧に戻る
        </a>
      </div>
    )
  }

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center text-gray-600 text-sm">
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
          <span className="mx-2">•</span>
          <span>{post.author.name}</span>
        </div>
        
        {/* タグ表示 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span 
              key={tag}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>
      
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.htmlContent }}
      />
      
      {/* ソーシャル共有ボタン（アイランド） */}
      <SocialShareButtons 
        title={post.title} 
        url={`https://example.com/blog/${slug}`}
      />
    </article>
  )
}

// サーバーサイドでのデータ取得
async function getPostBySlug(slug: string) {
  // データベースやCMSからデータを取得
  return {
    title: 'HonoXを始めよう',
    content: '...',
    htmlContent: '<p>HonoXは...</p>',
    publishedAt: '2024-01-15',
    author: { name: '田中太郎' },
    tags: ['HonoX', 'フロントエンド', 'チュートリアル']
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ja-JP')
}
```

### ページネーション機能

```typescript
// app/routes/blog/index.tsx
interface BlogIndexProps {
  page?: string
}

export default function BlogIndex({ page = '1' }: BlogIndexProps) {
  const currentPage = parseInt(page)
  const postsPerPage = 10
  
  const { posts, totalPages } = getPaginatedPosts(currentPage, postsPerPage)
  
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">ブログ</h1>
        <p className="mt-2 text-gray-600">開発に関する記事を書いています</p>
      </header>
      
      {/* 記事一覧 */}
      <div className="space-y-8">
        {posts.map(post => (
          <article key={post.slug} className="border-b pb-8">
            <h2 className="text-2xl font-semibold mb-2">
              <a 
                href={`/blog/${post.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {post.title}
              </a>
            </h2>
            
            <div className="text-gray-600 text-sm mb-3">
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            </div>
            
            <p className="text-gray-700 mb-4">{post.excerpt}</p>
            
            <a 
              href={`/blog/${post.slug}`}
              className="text-blue-600 hover:underline font-medium"
            >
              続きを読む →
            </a>
          </article>
        ))}
      </div>
      
      {/* ページネーション */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/blog"
      />
    </div>
  )
}
```

## インタラクティブ要素の統合

### アイランドとの連携

```typescript
// app/routes/contact.tsx
import { ContactForm } from '../islands/forms/ContactForm'
import { Map } from '../islands/ui/Map'

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* 左側：静的コンテンツ */}
        <div>
          <h1 className="text-4xl font-bold mb-6">お問い合わせ</h1>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">所在地</h3>
              <p className="text-gray-600">
                〒100-0001<br />
                東京都千代田区千代田1-1<br />
                千代田ビル 10F
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">営業時間</h3>
              <p className="text-gray-600">
                平日 9:00 - 18:00<br />
                土日祝日は休業
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">電話番号</h3>
              <p className="text-gray-600">03-1234-5678</p>
            </div>
          </div>
          
          {/* インタラクティブな地図（アイランド） */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">アクセス</h3>
            <Map 
              latitude={35.6762} 
              longitude={139.7653}
              zoom={15}
              className="w-full h-64 rounded-lg"
            />
          </div>
        </div>
        
        {/* 右側：インタラクティブフォーム（アイランド） */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">メッセージを送る</h2>
          <ContactForm apiEndpoint="/api/contact" />
        </div>
        
      </div>
    </div>
  )
}
```

### プログレッシブエンハンスメント

```typescript
// app/routes/shop/product/[id].tsx
import { AddToCartButton } from '../../../islands/ecommerce/AddToCartButton'
import { ProductGallery } from '../../../islands/ui/ProductGallery'
import { ReviewForm } from '../../../islands/forms/ReviewForm'

interface ProductPageProps {
  id: string
}

export default function ProductPage({ id }: ProductPageProps) {
  const product = getProductById(id)
  
  if (!product) {
    return <ProductNotFound />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* 商品画像（インタラクティブギャラリー） */}
        <div>
          <ProductGallery 
            images={product.images}
            alt={product.name}
          />
        </div>
        
        {/* 商品情報 */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold text-blue-600 mb-6">
            ¥{product.price.toLocaleString()}
          </p>
          
          <div className="prose mb-8">
            <p>{product.description}</p>
          </div>
          
          {/* スペック表（静的） */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">仕様</h3>
            <dl className="grid grid-cols-1 gap-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex">
                  <dt className="font-medium w-24">{key}:</dt>
                  <dd className="text-gray-600">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          
          {/* 購入ボタン（インタラクティブ） */}
          <AddToCartButton 
            productId={product.id}
            price={product.price}
            inStock={product.inStock}
          />
          
          {/* 在庫表示（静的だが、JSで更新可能） */}
          <div className="mt-4 text-sm text-gray-600">
            {product.inStock > 0 
              ? `在庫: ${product.inStock}点` 
              : '在庫切れ'
            }
          </div>
        </div>
        
      </div>
      
      {/* レビューセクション */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">カスタマーレビュー</h2>
        
        {/* 既存レビュー（静的） */}
        <div className="space-y-6 mb-12">
          {product.reviews.map(review => (
            <div key={review.id} className="border-b pb-6">
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {review.author} - {formatDate(review.createdAt)}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
        
        {/* レビュー投稿フォーム（インタラクティブ） */}
        <ReviewForm productId={product.id} />
      </div>
    </div>
  )
}
```

## レスポンシブデザインの実装

### モバイルファーストアプローチ

```typescript
// app/routes/index.tsx
export default function HomePage() {
  return (
    <div className="min-h-screen">
      
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              HonoXで始める
              <br className="hidden sm:block" />
              モダンWeb開発
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed mb-8 opacity-90">
              高速なSSR、効率的なアイランドアーキテクチャ、
              そして優れた開発体験を提供します。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/docs/getting-started"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold
                         hover:bg-gray-100 transition-colors text-center"
              >
                今すぐ始める
              </a>
              <a 
                href="/examples"
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold
                         hover:bg-white hover:text-blue-600 transition-colors text-center"
              >
                サンプルを見る
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* 特徴セクション */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">主な特徴</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              HonoXが提供する強力な機能で、Webアプリケーション開発を加速させましょう
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA セクション */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            今すぐHonoXを試してみませんか？
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            わずか数分でプロジェクトを立ち上げ、
            モダンなWebアプリケーションの開発を始められます。
          </p>
          
          {/* ニュースレター登録フォーム（インタラクティブ） */}
          <NewsletterSignup />
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: '⚡',
    title: '超高速SSR',
    description: 'サーバーサイドレンダリングによる高速な初期表示と優れたSEO'
  },
  {
    icon: '🏝️', 
    title: 'アイランドアーキテクチャ',
    description: '必要な部分のみJavaScriptを実行し、パフォーマンスを最適化'
  },
  {
    icon: '🔧',
    title: '柔軟性',
    description: 'ReactやVue等、好きなUIライブラリを選択可能'
  }
]
```

## SEO最適化

### 構造化データの実装

```typescript
// app/routes/blog/[slug].tsx
export default function BlogPost({ slug }: { slug: string }) {
  const post = getPostBySlug(slug)
  
  // 構造化データの作成
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author.name
    },
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://example.com/blog/${slug}`
    }
  }

  return (
    <div>
      {/* SEO メタタグ */}
      <title>{post.title} | My Blog</title>
      <meta name="description" content={post.excerpt} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`https://example.com/blog/${slug}`} />
      {post.featuredImage && (
        <meta property="og:image" content={post.featuredImage} />
      )}
      
      {/* 構造化データ */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* 記事コンテンツ */}
      <article>
        {/* ... */}
      </article>
    </div>
  )
}
```

## やってみよう！

HonoXでページ開発を実践してみましょう：

1. **ランディングページ**
   - ヒーローセクション
   - 特徴紹介
   - お問い合わせフォーム

2. **ブログシステム**
   - 記事一覧ページ
   - 個別記事ページ
   - カテゴリ別表示

3. **商品カタログ**
   - 商品一覧（フィルタリング機能）
   - 商品詳細ページ
   - ショッピングカート

## ポイント

- **SSRの活用**：SEOに優れた高速な初期表示
- **アイランド統合**：必要な部分のみインタラクティブ化
- **レスポンシブデザイン**：モバイルファーストアプローチ
- **メタデータ管理**：適切なSEO最適化
- **プログレッシブエンハンスメント**：段階的な機能向上

## 参考文献

- [HonoX ルーティングガイド](https://github.com/honojs/honox)
- [React Server Components](https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components)
- [Web Vitals 最適化](https://web.dev/vitals/)
- [アクセシビリティベストプラクティス](https://www.w3.org/WAI/WCAG21/quickref/)
