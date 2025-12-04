# REST API基礎

Web開発において重要なREST APIの基本的な概念と仕組みについて学んでいきましょう。REST APIを理解することで、Webアプリケーション開発の土台を築けます。

## REST APIとは

REST（Representational State Transfer）APIは、Webサービス間でのデータのやり取りを行うためのアーキテクチャパターンです。簡単に言うと、「決まった方法でデータを取得したり送信したりするためのルール」というわけです。

### RESTの基本原則

REST APIは以下の重要な原則に基づいています：

1. **ステートレス**：サーバーは前回のやり取りを覚えていません（気楽な関係ですね）
2. **統一インターフェース**：決まった方法でリソースにアクセスします
3. **階層化システム**：複数のサーバーを経由しても動作します
4. **キャッシュ可能**：レスポンスをキャッシュして効率化できます

## HTTPメソッドの基本

REST APIは主に以下のHTTPメソッドを使ってリソースを操作します：

### CRUD操作とHTTPメソッドの対応

| 操作   | HTTPメソッド | 意味                 | 例                 |
| ------ | ------------ | -------------------- | ------------------ |
| Create | POST         | 新しいリソースを作成 | ユーザー登録       |
| Read   | GET          | リソースを取得       | ユーザー情報の表示 |
| Update | PUT/PATCH    | リソースを更新       | プロフィール変更   |
| Delete | DELETE       | リソースを削除       | アカウント削除     |

### 実際のAPIエンドポイントの例

```
GET    /api/users        # 全ユーザーの一覧を取得
GET    /api/users/123    # ID 123のユーザー情報を取得
POST   /api/users        # 新しいユーザーを作成
PUT    /api/users/123    # ID 123のユーザー情報を更新
DELETE /api/users/123    # ID 123のユーザーを削除
```

見覚えのあるパターンですよね。この一貫性がRESTの魅力です。

## ステータスコード

APIからのレスポンスには、処理結果を示すHTTPステータスコードが付きます：

### よく使われるステータスコード

- **200 OK**：成功
- **201 Created**：作成成功
- **400 Bad Request**：リクエストが不正
- **401 Unauthorized**：認証が必要
- **404 Not Found**：リソースが見つからない
- **500 Internal Server Error**：サーバーエラー

## JSON形式でのデータ交換

REST APIでは、JSONフォーマットでデータのやり取りを行うのが一般的です：

### ユーザー情報のJSONレスポンス例

```json
{
  "id": 123,
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "createdAt": "2025-01-01T00:00:00Z",
  "profile": {
    "age": 30,
    "city": "東京"
  }
}
```

JSONは読みやすく、JavaScriptとの相性も抜群です（便利ですよね）。

## 実際のREST APIの例

### JSONPlaceholder API

練習によく使われる無料のテストAPIをご紹介します：

```
GET https://jsonplaceholder.typicode.com/posts/1
```

このリクエストを送ると、以下のようなレスポンスが返ってきます：

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum..."
}
```

### やってみよう！

ブラウザで以下のURLにアクセスしてみてください：

- <https://jsonplaceholder.typicode.com/posts>
- <https://jsonplaceholder.typicode.com/users>

実際のJSON形式のデータが確認できます。これがREST APIの基本的な動作です。

## REST APIの設計原則

### リソース指向の設計

- URLはリソース（モノ）を表現します
- 動詞ではなく名詞を使用します

```
Good: GET /api/users/123
Bad:  GET /api/getUser?id=123
```

### ネストしたリソースの表現

関連するリソースは階層構造で表現します：

```
GET /api/users/123/posts     # ユーザー123の投稿一覧
GET /api/posts/456/comments  # 投稿456のコメント一覧
```

## 認証とセキュリティ

### APIキーによる認証

多くのAPIでは、リクエストヘッダーにAPIキーを含めて認証します：

```
Authorization: Bearer your-api-key-here
```

### リクエスト制限

APIには通常、リクエスト回数の制限（レート制限）があります：

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
```

> **Note**: セキュリティ上、APIキーは環境変数で管理し、コードに直接書かないようにしましょう。

## まとめ

REST APIを理解することで、以下のことができるようになります：

### ポイント

- **REST API**: Web上でのデータ交換の標準的な方法
- **HTTPメソッド**: GET（取得）、POST（作成）、PUT（更新）、DELETE（削除）
- **ステータスコード**: 処理結果を示す3桁の数字
- **JSON形式**: APIでのデータ交換の標準フォーマット
- **リソース指向**: URLはリソース（モノ）を表現する
- **ステートレス**: サーバーは前回のやり取りを覚えていない

次の記事では、HTTPリクエストとJSONの詳細について学んでいきましょう。実際にブラウザの開発者ツールを使って、APIの動作を確認してみます。
