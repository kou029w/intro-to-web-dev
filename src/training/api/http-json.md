# HTTPリクエストとJSON

HTTPリクエストの仕組みとJSONデータの基本をつかみます。実際に動かしながら気楽にいきましょう。

## この記事で学べること

- HTTPリクエスト/レスポンスのしくみ（メソッド・URL・ヘッダーフィールド・ボディ）
- ステータスコードとContent-Type
- JSONの基本と注意点（数値/日付/ネスト）
- ブラウザとJavaScriptでJSONを扱う実例

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
> HTTP/2はHTTP/1.1とは異なり複数のメッセージを同時に扱える、コンピューターにとってより効率的な形式のシンタックスが特徴の新しい仕様です。
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

> Note: JSONに日付型はありません。通常はISO文字列（例: `"2025-01-01T00:00:00Z"`）として扱い、必要に応じてアプリ側でDate型に変換します。

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
async function getPost() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json(); // Content-Type: application/json が前提
  return data;
}

getPost().then(console.log).catch(console.error);
```

### JSONが返らないときの安全策

```js
async function safeParseJSON(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text(); // プレーンテキスト等にフォールバック
}
```

### リクエストボディにJSONを送る

```js
async function createPost(post) {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(post),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

createPost({ title: "Hello", body: "World", userId: 1 })
  .then(console.log)
  .catch(console.error);
```

> Note: `JSON.stringify`を忘れると、サーバーは意図しない形式（[object Object]など）を受け取り、400系エラーになることがあります。

### ステータスコードとエラーの見分け方

- 2xx: 成功 => `res.ok` が true
- 4xx: クライアント側の問題 => `res.ok` が false
- 5xx: サーバー側の問題 => `res.ok` が false

JavaScriptの`fetch`は「ネットワークに到達したら」例外を投げません。HTTP 404でも`res.ok`がfalseになるだけです（ちょっと紛らわしいですよね）。

```js
async function request(url) {
  const res = await fetch(url);
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err.message || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}
```

## やってみよう！

1. ブラウザで `https://jsonplaceholder.typicode.com/users` を開く
2. Chrome開発者ツールのNetworkタブでレスポンスヘッダー（Content-Type）を確認
3. `fetch`で同じURLを読み込み、配列長を`console.log`してみる

```js
const url = "https://jsonplaceholder.typicode.com/users";
fetch(url)
  .then((r) => r.json())
  .then((users) => console.log("件数:", users.length));
```

## ポイント（まとめ）

- HTTPは「メソッド・URL・ヘッダー・ボディ」のセット
- JSONはテキスト表現のオブジェクト。日付は文字列で扱うのが基本
- `Content-Type`を見て正しくパース（`response.json()` or `response.text()`）
- `fetch`は404でも例外にしない。`res.ok`を必ず確認
- 送信時は`Content-Type: application/json`と`JSON.stringify`を忘れずに
