# GitHubで学ぶREST API実践

GitHubのREST APIを題材に、VS Code拡張のThunder Clientとfetchの両アプローチでAPIを扱う基礎をまとめました。認証（PAT）の扱い、代表的なエンドポイント、トラブルシューティングまで一気に押さえます。

## この記事で学べること

- Thunder Clientの導入と基本操作
- 読み取りAPI（非認証）と認証APIの違い
- Personal Access Token（PAT）の発行と安全な使い方
- GitHub APIをThunder Clientとfetchで叩く実例

## Thunder Clientとは（導入と基本操作）

Thunder Clientは、VS Code上で動作する軽量なRESTクライアントです。APIの試行錯誤やリクエスト保存が簡単にできます。

### インストール

1. VS Codeを開き、拡張機能ビューを開く
2. "Thunder Client" を検索してインストール
   - マーケットプレイス: https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client

### Thunder Client の基本的な使い方

#### リクエストの作成と編集

1. HTTPメソッドの選択
   - 右側のペインで `[GET]` をクリックし、`POST` や `PUT` などのメソッドを選択可能です。
2. URLの入力
   - `Enter URL` フィールドに対象APIのURLを入力します。
   - 例: `https://www.thunderclient.com/welcome`
3. クエリパラメータの指定
   - `Query` タブで、HTTPクエリパラメータを編集します。
   - 例: `?parameter1=value1&parameter2=value2` の形式で記述。
4. ヘッダーの編集
   - `Headers` タブでHTTPリクエストヘッダーを指定します。
   - 必要に応じて `Authorization` ヘッダーや `Content-Type` を設定。
5. リクエストの送信
   - 編集が終わったら、右上の `Send` ボタンをクリックしてリクエストを発行します。

#### リクエストの保存

- 左側のペインで `Activity` タブを選択し、履歴を確認可能。
- リクエストを保存したい場合は `...` ボタンをクリックし、`Save to Collection` を選択。

## GitHub APIの基本（非認証と認証）

### 非認証でできること（読み取り）

公開情報（ユーザーや公開リポジトリなど）はトークンなしで取得できます。ただしレート制限が厳しめです（未認証はおおむね1時間に60リクエスト程度）。

```ts
const res = await fetch("https://api.github.com/users/octocat");
const data = await res.json();
console.log(data.login, data.public_repos);
```

### 認証（PAT）

1. [GitHub PAT発行ページ](https://github.com/settings/tokens) にアクセス。
2. `Generate new token` をクリック。
3. トークンの名前を指定し、必要な権限（例: `user`）にチェックを入れる。
4. トークンを生成し、表示された値をメモします。(※ 生成したトークンは安全に保管（環境変数など）。フロントエンドに埋め込まないこと。)
   - 参考: [GitHubトークンの作成ガイド](https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

## Thunder ClientでGitHub APIを叩く

- URL: `https://api.github.com/users/{username}`（例: `octocat`）
- 認証が必要なAPI（例: `/user`）は、Headersに`Authorization: token <PAT>`（または `Authorization: Bearer <PAT>`）を設定

レスポンス例:

```json
{
  "login": "octocat",
  "id": 583231,
  "public_repos": 8
}
```

## fetchでGitHub APIを叩く（サーバー側推奨）

トークンは環境変数で管理し、サーバー側から呼び出すのが原則です。

```ts
// 自分のユーザー情報を取得（認証が必要）
const token = process.env.GITHUB_TOKEN as string;
const res = await fetch("https://api.github.com/user", {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  },
});
const me = await res.json();
```

代表的なエンドポイント:

- ユーザー情報: GET `/users/{username}`（公開）/ GET `/user`（認証）
- リポジトリ一覧: GET `/users/{username}/repos`
- Issue作成: POST `/repos/{owner}/{repo}/issues`

```ts
// Issue作成（サーバー側で実行）
await fetch("https://api.github.com/repos/OWNER/REPO/issues", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ title: "バグ報告", body: "再現手順..." }),
});
```

## トラブルシューティング

- 401/403: 認証情報不足。`Authorization`ヘッダー、トークンスコープ、レート制限を確認
- 422 Unprocessable Entity: 入力不足・不正。必須パラメータやJSONの形を見直す
- レート制限: 未認証は特に制限が厳しい。認証＋適切なヘッダーを付与

## 演習

1. 非認証で `/users/octocat` を取得し、`public_repos` を表示
2. PATを作成し、認証付きで `/user` を叩いて自分の情報を取得
3. （発展）サーバー側で自分のリポジトリにIssueを1件作成
4. （応用）Thunder Clientで別の公開API（例: OpenWeather）を叩いてレスポンスを観察

OpenWeatherの例:

- URL: `http://api.openweathermap.org/data/2.5/weather`
- Query: `?q=London&appid={API_KEY}`

## 参考リンク

- GitHub REST API v3: https://docs.github.com/ja/rest
  - 認証: https://docs.github.com/ja/rest/overview/authenticating-to-the-rest-api
- Thunder Client: https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client
