# HTTPリクエストとJSON

[💡 NotebookLM で解説を聞く](https://notebooklm.google.com/notebook/68068ab3-d9eb-46d3-915c-ff8cf453d1ea)

前回の [REST API基礎](rest-basics.md) で、REST APIの概念とメリットを学びました。今回は、HTTPリクエストの詳しい仕組みとJSONデータの実践的な扱い方を身につけます。実際に動かしながら気楽にいきましょう。

## この記事で学べること

- HTTPリクエスト/レスポンスのしくみ（メソッド・URL・ヘッダーフィールド・ボディ）
- ステータスコードとContent-Type
- JSONの基本と注意点（数値/日付/ネスト）
- ブラウザとJavaScriptでJSONを扱う実例
- 実践的なパターン（認証、クエリパラメータ、エラーハンドリング、複数API呼び出し）

## HTTPのしくみを分解

HTTP（HyperText Transfer Protocol）は、クライアント（例: ブラウザ）とサーバーが会話するためのルールです。会話の1往復をもう少し細かく見てみましょう。

### プロトコル

![](assets/communication.png)

> ― この画像は © 2012 Karl Dubost クリエイティブ・コモンズ [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) ライセンスのもとに利用を許諾されています。

二者間でのコミュニケーションが成立するためには3つの要素が含まれています。

- <ruby>シンタックス<rt>Syntax</rt></ruby> (コードの文法)
- <ruby>セマンティクス<rt>Semantics</rt></ruby> (コードの意味)
- <ruby>タイミング<rt>Timing</rt></ruby> (速度合わせと順序付け)

「挨拶」を例に考えてみましょう。
腰を曲げるジェスチャー、これはお辞儀のためのシンタックスです。日本ではそういう慣習ですね。お辞儀をすることで「どうも、こんにちは」という意味づけが行われます。これはセマンティクスです。二者間で特定のタイミングでこれらが発生したとき、一連の出来事として成立します。どちらもお辞儀をし、お互いに理解することによって「挨拶」として成立した、となるわけです。

Web上でのやり取りも同じです。
HTTPはサーバー・クライアントの二者関係で行われます。
クライアントはサーバーに対して<ruby>要求<rt>リクエスト</rt></ruby>を送り、クライアントからの<ruby>要求<rt>リクエスト</rt></ruby>を受け取るとサーバーは<ruby>応答<rt>レスポンス</rt></ruby>を返します。

[HTTPの仕様](https://www.rfc-editor.org/rfc/rfc9110#name-example-message-exchange)にある具体例を挙げます。
次のようなコードの送受信を行います。

#### リクエストの構成

- メソッド: 何をしたいか（GET/POST/PUT/PATCH/DELETE など）
- URL: どこに（https://www.example.com/hello.txt など）
- ヘッダー: 追加情報（認証やデータ形式）※HTTP/1.1仕様では「ヘッダーフィールド (Header Fields)」とも表記されます
- ボディ: 本文（POST/PUT で送るJSONなど）

具体例:

```
GET /hello.txt HTTP/1.1
User-Agent: curl/7.64.1
Host: www.example.com
Accept-Language: en, mi

```

> **Note**\
> HTTP/1.1 と HTTP/2
>
> [HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112.html)は1995年に公開され、2022年に最新版に改定されました。
> HTTP/1.1は現在も使われ続けています。
> 一方、[HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html)は2022年に公開されました。
> HTTP/2はHTTP/1.1とは異なり複数のメッセージを同時に扱える、コンピューターにとってより効率的な形式の仕様です。
> HTTP/2ではリクエストラインの代わりに一貫してフィールドを使うなどHTTP/1.1と文法が大きく異なりますがその意味は全く変わりません。
>
> [HTTP/2 仕様のリクエストの例](https://www.rfc-editor.org/rfc/rfc9113.html#section-8.8.1):
>
> ```
>   GET /resource HTTP/1.1           HEADERS
>   Host: example.org          ==>     + END_STREAM
>   Accept: image/jpeg                 + END_HEADERS
>                                        :method = GET
>                                        :scheme = https
>                                        :authority = example.org
>                                        :path = /resource
>                                        host = example.org
>                                        accept = image/jpeg
> ```

#### レスポンスの構成

- ステータスライン: (例) HTTP/1.1 200 OK
- ヘッダーフィールド: (例) Content-Type: text/plain
- ボディ: データ本体

具体例:

```
HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT
Server: Apache
Last-Modified: Wed, 22 Jul 2009 19:15:56 GMT
ETag: "34aa387-d-1568eb00"
Accept-Ranges: bytes
Content-Length: 51
Vary: Accept-Encoding
Content-Type: text/plain

Hello World! My content includes a trailing CRLF.
```

### ステータスコード (Status Codes)

> [![](https://http.cat/images/500.jpg)](https://http.cat/status/500)\
> _― 画像: [HTTP Cats](https://http.cat/) より_

「ステータスコード (Status Codes)」はそのリソースの存在やアクセス可否などをサーバーが伝えるためのものです。
サーバーはレスポンスを返すとき、最初にステータスコードを返します。

サーバーレスポンス:

```
HTTP/1.1 200 OK
```

この例ではステータスコード `200` を返しています。
ステータスコードは100〜599までの3桁の整数で表されます。
レスポンスはステータスコードの100の位で大きく分類されます。

- 1xx (情報): リクエストを受信しました。プロセスを続行します。
- **2xx** (成功): リクエストは正常に受信、理解され、受け入れられました。
- 3xx (リダイレクト): リクエストを完了するにはさらにアクションを実行する必要があります。
- **4xx** (クライアントエラー): リクエストに不正な構文が含まれているか、リクエストを実行できません。
- **5xx** (サーバーエラー): サーバーは有効なリクエストを実行できません。

> **Note**\
> 418 I'm a teapot
>
> 私はティーポットなのでコーヒーを入れることを拒否しました、という意味のステータスコードです。
> [1998年のエイプリルフール](https://www.rfc-editor.org/rfc/rfc2324.html)に公開されました。
> 現在でもステータスコード `418` は [IANA HTTP Status Code Registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml) によって管理されています。

## JSONの基本（JavaScript Object Notation）

JSONは「データをテキストで表す決まり」です。JavaScriptとの相性が良く、Web APIでよく使われます。

### よく使う型

- オブジェクト: `{ "id": 1, "name": "Taro" }`
- 配列: `[1, 2, 3]` や `[{"id":1},{"id":2}]`
- 文字列/数値/真偽値/null: `"hello"`, `42`, `true`, `null`

> **Note**: JSONに日付型はありません。通常はISO文字列（例: `"2025-01-01T00:00:00Z"`）として扱い、必要に応じてアプリ側でDate型に変換します。

## 具体例：公開APIを叩いてみる

まずは読み取りだけの安全なAPIで体験しましょう。学習用途で有名なJSONPlaceholderを使います。

エンドポイント例:

- GET <https://jsonplaceholder.typicode.com/posts/1>

ブラウザでURLを開くだけでもOKです。ネットワーク通信を詳しく見たいときは、Chromeの開発者ツール > Network タブを開いてみましょう（面白いですよ）。

レスポンス例（抜粋）:

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit..."
}
```

## JavaScriptでJSONを扱う

JavaScriptでは`fetch`を使って簡単にJSONを取得できます。

### 基本のパターン

```js
async function getData() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  // res.text() ではなく res.json() なのがポイント
  const data = await res.json();
  return data;
}

const data = await getData();
console.log(data);
console.log(typeof data);
```

この例では：

1. `fetch()`でURLにリクエストを送る
2. `res.ok`でステータスコードが2xxかどうか確認
3. `res.json()`でJSONをJavaScriptオブジェクトに変換

### Content-Typeを確認する

レスポンスが本当にJSONかどうか確認してから`res.json()`を呼ぶと安全です。

```js
async function getData() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");

  const contentType = res.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  } else {
    return await res.text();
  }
}

const data = await getData();
console.log(data);
console.log(typeof data); // "object" か "string"
```

なぜこうするのか：サーバーがエラーメッセージをHTMLやテキストで返すことがあります。そのときに`res.json()`を呼ぶとエラーになるため、Content-Typeヘッダーで判断します。

### リクエストボディにJSONを送る（POSTの例）

データを送るときは`method`と`headers`、`body`を指定します。

```js
async function createPost(post) {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return await res.json();
}

const data = await createPost({ title: "Hello", body: "World", userId: 1 });
console.log(data);
```

ポイント：

- `method: "POST"` → サーバーにデータを送る
- `Content-Type: application/json` → 送るデータの形式を伝える
- `JSON.stringify(post)` → JavaScriptオブジェクトをJSON文字列に変換

> **Note**: `JSON.stringify`を忘れると、サーバーは `[object Object]` という文字列を受け取ってしまい、400エラーになることがあります。

### ステータスコードとエラーの見分け方

- 2xx: 成功 → `res.ok` が `true`
- 4xx: クライアント側の問題 → `res.ok` が `false`
- 5xx: サーバー側の問題 → `res.ok` が `false`

JavaScriptの`fetch`は、ネットワークに到達できれば例外を投げません。つまりHTTP 404やHTTP 500でも`res.ok`が`false`になるだけです（ちょっと紛らわしいですよね）。

だから、必ず`res.ok`をチェックしましょう：

```js
async function fetchUser(id) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);

  if (!res.ok) {
    throw new Error(`エラー: HTTP ${res.status}`);
  }

  return await res.json();
}

// 使用例
const data = await fetchUser(9999);
console.log(data);
```

なぜこうするのか：`res.ok`をチェックしないと、404エラーでも`res.json()`を呼んでしまい、意図しない動作になります。

## やってみよう！

1. ブラウザで `https://jsonplaceholder.typicode.com/users` を開く
2. Chrome開発者ツールのNetworkタブでレスポンスヘッダー（Content-Type）を確認
3. `fetch`で同じURLを読み込み、配列長を`console.log`してみる

```js
const res = await fetch("https://jsonplaceholder.typicode.com/users");
const data = await res.json();
console.log("件数:", data.length);
```

## 実践的なパターン

ここまでの基礎を踏まえて、実際のアプリ開発でよく使うパターンを見ていきましょう。

### 認証が必要なAPIを呼び出す

多くの実用的なAPIでは、API キーやトークンを使った認証が必要です。これらは`Authorization`ヘッダーに含めて送ります。

```js
async function fetchWithAuth() {
  const res = await fetch("https://api.example.com/user/profile", {
    headers: {
      Authorization: "Bearer YOUR_API_TOKEN",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return await res.json();
}

await fetchWithAuth();
```

なぜこうするのか：サーバーは`Authorization`ヘッダーで「誰がアクセスしているか」を確認します。`Bearer`はトークン認証の標準的な方式です。

> **Note**: APIキーやトークンは環境変数（`.env`ファイル）で管理し、コードに直接書かないようにしましょう。GitHubなどに誤って公開してしまうと、第三者に悪用される危険があります。

### クエリパラメータでデータを絞り込む

GETリクエストでは、URLにパラメータを付けてデータを絞り込むことができます（検索機能やページネーションで頻繁に使います）。

```js
// 手動でURLを組み立てる方法
const userId = 1;
const res = await fetch(
  `https://jsonplaceholder.typicode.com/posts?userId=${userId}`,
);

// URLSearchParamsを使う方法（推奨）
const query = new URLSearchParams({ userId: 1, _limit: 5 });
const res2 = await fetch(
  `https://jsonplaceholder.typicode.com/posts?${query}`,
);

const data = await res2.json();
console.log(data); // 最大5件のデータが返ってくる
```

なぜこうするのか：`URLSearchParams`を使うと、特殊文字のエンコード（例：スペースを`%20`に変換）を自動でやってくれるため安全です。

### ステータスコードに応じたエラー処理

基本の`res.ok`チェックに加えて、ステータスコードごとに適切なエラーメッセージを返すとユーザー体験が向上します。

```js
async function fetchWithDetailedError(url) {
  const res = await fetch(url);

  if (!res.ok) {
    // ステータスコードごとに適切なエラーメッセージを返す
    switch (res.status) {
      case 400:
        throw new Error("リクエストが不正です");
      case 401:
        throw new Error("認証が必要です");
      case 404:
        throw new Error("データが見つかりません");
      case 500:
        throw new Error("サーバーエラーが発生しました");
      default:
        throw new Error(`HTTP ${res.status}`);
    }
  }

  return await res.json();
}

// サーバーエラーが発生!
await fetchWithDetailedError("https://httpbin.org/status/500");
```

なぜこうするのか：エラーの原因が分かれば、ユーザーに「再ログインしてください」「URLを確認してください」といった具体的な対処法を案内できます。

### 複数のAPIを順番に呼び出す

実際のアプリ開発では、1つのリソースに関連する複数のデータを取得することがよくあります。

```js
async function getUserWithPosts(userId) {
  try {
    // 1. ユーザー情報を取得
    const userRes = await fetch(
      `https://jsonplaceholder.typicode.com/users/${userId}`,
    );
    if (!userRes.ok) throw new Error("ユーザー情報の取得に失敗");
    const user = await userRes.json();

    // 2. そのユーザーの投稿を取得
    const postsRes = await fetch(
      `https://jsonplaceholder.typicode.com/posts?userId=${userId}`,
    );
    if (!postsRes.ok) throw new Error("投稿の取得に失敗");
    const posts = await postsRes.json();

    // 3. データを結合して返す
    return { ...user, posts };
  } catch (error) {
    console.error("エラー:", error);
    throw error;
  }
}

// 使用例
const data = await getUserWithPosts(1);
console.log(`${data.name}さんの投稿数: ${data.posts.length}`);
```

なぜこうするのか：ユーザーのプロフィールページを表示するとき、「ユーザー情報」と「そのユーザーの投稿一覧」を両方取得する必要があります。このように複数のAPIを組み合わせることで、より豊かなアプリケーションが作れます。

## ポイント（まとめ）

- HTTPは「メソッド・URL・ヘッダー・ボディ」のセット
- JSONはテキスト表現のオブジェクト。日付は文字列で扱うのが基本
- `Content-Type`を見て正しくパース（`response.json()` or `response.text()`）
- `fetch`は404でも例外にしない。`res.ok`を必ず確認
- 送信時は`Content-Type: application/json`と`JSON.stringify`を忘れずに
