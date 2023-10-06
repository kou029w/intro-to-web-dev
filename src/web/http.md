# HTTP - Hypertext Transfer Protocol

HTTPはWebの転送用のプロトコルです。

URLがあればそのリソースがWeb上の「どこに」あるか知ることができます。
ではそのリソースには「どのように」アクセスしたらよいのでしょうか。

`https` スキームや `http` スキームのURLに対応するリソースにアクセスする<ruby>手順<rt>プロトコル</rt></ruby>、それがHTTPです。

## プロトコル

![](assets/communication.png)

> ― この画像は © 2012 Karl Dubost クリエイティブ・コモンズ [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) ライセンスのもとに利用を許諾されています。

二者間でのコミュニケーションが成立するためには3つの要素が含まれています。

- シンタックス (コードの文法)
- セマンティクス (コードの意味)
- タイミング (速度合わせと順序付け)

「挨拶」を例に考えてみましょうか。
腰を曲げるジェスチャー、これはお辞儀のためのシンタックスです。日本ではそういう慣習ですね。お辞儀をすることで「どうも、こんにちは」という意味づけが行われます。これはセマンティクスです。どちらもお辞儀をし、お互いに理解することによって「挨拶」として成立します。二者間で特定のタイミングでこれらが発生したとき、一連の出来事として成立した、となるわけです。

Web上でのやり取りも同じです。
HTTPはサーバー・クライアントの二者関係で行われます。
クライアントはサーバーに対して<ruby>要求<rt>リクエスト</rt></ruby>を送り、クライアントからの<ruby>要求<rt>リクエスト</rt></ruby>を受け取るとサーバーは<ruby>応答<rt>レスポンス</rt></ruby>を返します。

[HTTPの仕様](https://www.rfc-editor.org/rfc/rfc9110#name-example-message-exchange)にある具体例を挙げます。
次のようなコードの送受信を行います。

クライアントリクエスト (クライアント側からサーバー側への送信):

```
GET /hello.txt HTTP/1.1
User-Agent: curl/7.64.1
Host: www.example.com
Accept-Language: en, mi

```

サーバーレスポンス (サーバー側からクライアント側への送信):

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

構成要素は4つ。

- リクエストライン (Request Line)
- フィールド (Fields)
- ステータスコード (Status Codes)
- コンテンツ (Content)

詳しく見ていきましょう。

## リクエストライン (Request Line)

クライアントリクエストの1行目の `GET /hello.txt HTTP/1.1` の部分は、[リクエストライン (Request Line)](https://datatracker.ietf.org/doc/html/rfc9112#name-request-line) と呼ばれます。どこに、どのような<ruby>方法<rt>メソッド</rt></ruby>でアクセスしたい、とサーバーに伝えるためのものです。

クライアントリクエスト:

```
GET /hello.txt HTTP/1.1
```

この例はURL `http://www.example.com/hello.txt` にアクセスするためのクライアントリクエストです。`GET` メソッドでパス `/hello.txt` のリソースへのアクセスを要求しています。

`GET` メソッドは取得するために使われる最も基本的なメソッドで、Webブラウザーのリンクをクリックしたときや、アドレスバーに入力すると送信されます。Webでのやり取りはこのリクエストラインで始まる文字列をWebサーバーに伝えるところから始まります。

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

## フィールド (Fields)

`:` 文字で区切られた行が続きます。これは「フィールド (Fields)」です。リクエストとレスポンスに関連する付帯情報を意味します。

```
Host: www.example.com
```

例えばこの場合、送信先 `Host` (ホスト) は `www.example.com` ですよ、という意味です。

## ステータスコード (Status Codes)

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
- 2xx (成功): リクエストは正常に受信、理解され、受け入れられました。
- 3xx (リダイレクト): リクエストを完了するにはさらにアクションを実行する必要があります。
- 4xx (クライアントエラー): リクエストに不正な構文が含まれているか、リクエストを実行できません。
- 5xx (サーバーエラー): サーバーは有効なリクエストを実行できません。

> **Note**\
> 418 I'm a teapot
>
> 私はティーポットなのでコーヒーを入れることを拒否しました、という意味のステータスコードです。
> [1998年のエイプリルフール](https://www.rfc-editor.org/rfc/rfc2324.html)に公開されました。
> 現在でもステータスコード `418` は [IANA HTTP Status Code Registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml) によって管理されています。

## コンテンツ (Content)

フィールドが終わり「コンテンツ (Content)」が続きます。
コンテンツはHTML、画像、動画、あらゆるデータです。

## ポイント

- HTTPはWebの転送用のプロトコル
- HTTPはクライアントからのリクエストとサーバーからのレスポンスによってやり取りを行う
- HTTPの構成要素 … リクエストライン/フィールド/ステータスコード/コンテンツ
