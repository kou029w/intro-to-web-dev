# REST API基礎

[💡 NotebookLM で解説を聞く](https://notebooklm.google.com/notebook/dc7a1bfb-7b04-43cc-b4b3-11c50917edb5)

Web開発において重要なREST APIの基本的な概念と仕組みについて学んでいきましょう。REST APIを理解することで、Webアプリケーション開発の土台を築けます。

## なぜREST APIが必要なのか

現代のWebアプリケーション（TwitterやInstagram、Googleマップなど）を使うとき、画面を操作するだけでデータが表示されたり更新されたりしますよね。
もし、これらのアプリケーションがサーバーとデータをやり取りするための共通のルールがなければ、開発は非常に複雑で非効率的になります。

REST APIを使うことで、開発者は以下のメリットを得られます:

- **関心の分離** … フロントエンドとバックエンドでの独立した開発が可能
- **マルチプラットフォーム対応** … Web、iOS、Androidで同じAPIを利用可能
- **外部サービス連携** … ログインにGoogleやFacebookアカウントを使うなど、他サービスとの連携が可能

## REST APIとは

REST（Representational State Transfer）APIは、Webサービス間でのデータのやり取りを行うための非常にシンプルなアーキテクチャパターンです。簡単に言うと、「**統一されたルールに基づいてデータを取得・送信する仕組み**」というわけです。

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

APIからのレスポンスには、処理結果を示すHTTPステータスコードが付きます。例えば：

- **200 OK**：成功
- **404 Not Found**：リソースが見つからない
- **500 Internal Server Error**：サーバーエラー

ステータスコードの詳細や実際の使い分けについては、次の記事で学びます。

## JSON形式でのデータ交換

REST APIでは、JSONフォーマットでデータのやり取りを行うのが一般的です。JSONは読みやすく、JavaScriptとの相性も抜群です（便利ですよね）。

JSONの詳しい構造や実際のJavaScriptでの扱い方については、次の記事で詳しく学びます。

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

実際のAPIを使う際には、認証が必要になることがあります。

> **Note**: 多くの公開APIでは、リクエストヘッダーにAPIキーを含めて認証を行います。また、APIには通常リクエスト回数の制限（レート制限）があるため、利用規約を確認しましょう。セキュリティ上、APIキーは環境変数で管理し、コードに直接書かないようにしましょう。

## ポイント（まとめ）

REST APIは、現代のWeb開発において**フロントエンドとバックエンドを分離し、複数のプラットフォームで同じデータを活用する**ための重要な仕組みです。統一されたルールに基づくことで、開発の効率化や保守性の向上を実現できます。

- **REST APIの必要性**: フロントエンドとバックエンドの分離、複数プラットフォーム対応、外部サービス連携を可能にする
- **REST API**: Web上でデータをやり取りするための統一された設計原則・方式
- **HTTPメソッド**: GET（取得）、POST（作成）、PUT（更新）、DELETE（削除）といった操作を表す
- **ステータスコード**: リクエストの処理結果を示す3桁の数字（例：200 OK、404 Not Found）
- **JSON形式**: APIにおける標準的なデータ交換フォーマット
- **リソース指向**: URLは操作ではなく、対象となるリソース（モノ）を表現する

## 次のステップ

次は [HTTPリクエストとJSON](http-json.md) で、HTTPの詳しい仕組みとJSONデータの扱い方を実践的に学んでいきます。開発者ツールを使い、実際のAPI通信を確認しながら理解を深めていきましょう。
