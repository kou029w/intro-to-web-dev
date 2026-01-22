# GitHubで学ぶREST API実践

[💡 NotebookLM で解説を聞く](https://notebooklm.google.com/notebook/e8e56e3a-4c0e-4268-b28a-be71a7802036)

GitHub の REST API を題材に fetch API で扱う基礎をまとめました。認証 (PAT) の扱い、代表的なエンドポイント、トラブルシューティングまで一気に押さえます。

## この記事で学べること

- 読み取りAPI (非認証) と認証APIの違い
- Personal Access Token (PAT) の発行と安全な使い方

## GitHub APIの基本 (非認証と認証)

### 非認証でできること (読み取り)

公開情報 (ユーザーや公開リポジトリなど) はトークンなしで取得できます。ただしレート制限が厳しめです (未認証はおおむね1時間に60リクエスト程度)。

```js runnable
const res = await fetch("https://api.github.com/users/octocat");
const data = await res.json();
console.log(data.login, data.public_repos);
```

### 認証 (PAT)

1. [GitHub PAT発行ページ](https://github.com/settings/tokens) にアクセス。
2. `Generate new token` をクリック。
3. トークンの名前を指定。
4. トークンを生成し、表示された値をメモします。(※ 生成したトークンは安全に保管 (環境変数など)。フロントエンドに埋め込まないこと。)
   - 参考: [GitHubトークンの作成ガイド](https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

## fetchでGitHub APIを叩く (サーバー側推奨)

トークンは環境変数で管理し、サーバー側から呼び出すのが原則です。

```ts
// 自分のユーザー情報を取得 (認証が必要)
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

- ユーザー情報: GET `/users/{username}` (公開) / GET `/user` (認証)
- リポジトリ一覧: GET `/users/{username}/repos`
- Issue作成: POST `/repos/{owner}/{repo}/issues`

```ts
// Issue作成 (サーバー側で実行)
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

## やってみよう！

1. 非認証で `/users/octocat` を取得し、`public_repos` を表示
2. PATを作成し、認証付きで `/user` を叩いて自分の情報を取得
3. (発展) 別の公開APIを叩いてレスポンスを観察

## 参考リンク

- GitHub REST API v3: <https://docs.github.com/ja/rest>
  - 認証: <https://docs.github.com/ja/rest/overview/authenticating-to-the-rest-api>
