# URL - Uniform Resource Locator

URLはインターネット上のリソースの位置を特定するための文字列です。
住所と似ています。

[URLの仕様](https://url.spec.whatwg.org/#example-url-components)からいくつか具体例を挙げます。

例:

```
https://example.com/
https://localhost:8000/search?q=text#hello
urn:isbn:9780307476463
file:///ada/Analytical%20Engine/README.md
```

これらはいずれもURLです。

[リンク (ハイパーリンク)](https://developer.mozilla.org/ja/docs/Learn/Common_questions/Web_mechanics/What_are_hyperlinks) させたいときURLを使います。

ユニフォーム (uniform) と名前にあるのは、統一的なルールがあります、ということです。
Web上で「〇〇にアクセスしたい」と思ったときみんなで使える同じ表現があったほうが便利というわけですね。

ではURLにはどういうルールがあるのか詳しく見ていきましょう。

## スキーム (Scheme)

URLの種別や性質を意味します。

`https://example.com/`

この例でいうと、先頭から `:` までの文字列 `https` が「スキーム」です。住所の例で言うと、郵便を表す記号「〒」の役割と似ています。URLはスキームごとにその書式が異なります。

> **Note**\
> インターネット上で利用可能なURLスキームの一覧
>
> [Uniform Resource Identifier (URI) Schemes](https://www.iana.org/assignments/uri-schemes/uri-schemes.xhtml)
>
> インターネット上で利用可能なURLスキームの一覧はIANA (Internet Assigned Numbers Authority)によって管理されています。

`https` スキームは Hypertext Transfer Protocol Secure ([RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-https-uri-scheme)) を意味します。その後に文字列 `://` が続きます。

`https` スキームのURLの場合は、その後に「ホスト (Host)」「ポート (Port)」「パス (Path)」「クエリー (Query)」「フラグメント (Fragment)」と続きます。

> **Note**\
> `http` と `https`
>
> 前者は "Hypertext Transfer Protocol"、後者は "Hypertext Transfer Protocol Secure" を意味するスキームです。
> "Secure" と付いているのは、必ず [TLS (Transport Layer Security)](https://datatracker.ietf.org/doc/html/rfc8446) の上でやり取りを行います、という意味です。
> 最近 `http://...` ってURLを見かけなくなったかと思います。
> これはHTTPのセキュリティとプライバシーの問題が広く知られ、HTTP over TLSに置き換わっていったためです。
> TLSを使うことによってクライアント・サーバー間の通信が暗号化され、もし仮に傍受されても第三者による改ざんや解析は以前より難しくなりました。

## ホスト (Host)

郵便番号と住所みたいなものです。「ポスト」じゃないですよ。

`https://example.com/`

この例でいうと、`example.com` の部分が「ホスト」です。
ホストは[ドメイン名](https://developer.mozilla.org/ja/docs/Learn/Common_questions/Web_mechanics/What_is_a_domain_name)または[IPアドレス](https://ja.wikipedia.org/wiki/IP%E3%82%A2%E3%83%89%E3%83%AC%E3%82%B9)です。
ドメイン名を見かけることが多いかと思います。

> **Note**\
> ドメイン名
>
> インターネットに接続しているすべてのコンピューターやネットワーク機器にはIPアドレスが割り当てられています。
> ドメイン名はそうしたIPアドレスに人間が読めるように別の名前を付けたものです。
> ドメイン名は [Domain Name System (DNS)](https://ja.wikipedia.org/wiki/Domain_Name_System) によって支えられています。
> [Internet Corporation for Assigned Names and Numbers (ICANN)](https://www.icann.org/) を中心とした複数のドメイン管理事業者によって管理されており、世界中で使うことができるようになっています。
>
> 例:
> [Google Public DNS に `example.com` を問い合わせる例](https://dns.google/query?rr_type=AAAA&name=example.com)
>
> ```
> "Answer": [
>   {
>     "name": "example.com.",
>     "type": 28 /* AAAA */,
>     "TTL": 13460,
>     "data": "2606:2800:220:1:248:1893:25c8:1946"
>   }
> ]
> ```
>
> ドメイン名 `example.com` はIPアドレス `[2606:2800:220:1:248:1893:25c8:1946]` の別名ですよ、という意味です。

## ポート (Port)

「[ポート](https://ja.wikipedia.org/wiki/%E3%83%9D%E3%83%BC%E3%83%88_%28%E3%82%B3%E3%83%B3%E3%83%94%E3%83%A5%E3%83%BC%E3%82%BF%E3%83%8D%E3%83%83%E3%83%88%E3%83%AF%E3%83%BC%E3%82%AF%29)」が書いてあるURLは普段あまり見かけないかもしれませんね。
でも通信するためには必ず存在します。存在するからには一応紹介しておきます。

ホストの後にはポートを書くことができます。
ホストと `:` 文字の後にポート番号を書きます。
省略すると `https` スキームの場合は `443` が割り当てられています。

例えばこれらのURLは同じ意味です。

```
https://example.com/
https://example.com:443/
```

この場合どちらも `443` ポートを意味します。

## パス (Path)

`/` 文字で区切られた文字列が続きます。これが「パス」です。ホストの中のリソースの場所を意味します。

```
https://example.com/
```

この場合パスは `/` です。

```
https://example.com/foo/bar
```

この場合パスは `/for/bar` です。

ちなみにJavaScriptでは [`location.pathname`](https://developer.mozilla.org/ja/docs/Web/API/Location/pathname) でパスを取得できます。

## クエリー (Query)

`?` 文字で区切られた文字列が続くことがあります。場合によっては `=` や `&` が含まれます。これは「クエリー」です。

```
https://localhost:8000/search?q=text#hello
```

例えばこの例では `q=text` がクエリーです。

Google検索の例: <https://www.google.com/search?q=answer+to+life+the+universe+and+everything>

この場合クエリーは `q=answer+to+life+the+universe+and+everything` です。

JavaScriptでは [`location.search`](https://developer.mozilla.org/ja/docs/Web/API/Location/search) でクエリーを取得できます。

## フラグメント (Fragment)

`#` 文字で区切られた文字列が続くことがあります。これは「フラグメント」です。
URLの末尾にフラグメントがあるとき、そのリソースの中の一部分を意味します。
HTMLの場合はフラグメントと `id` 属性の名前が一致するときその箇所を指定することができます。

```
https://localhost:8000/search?q=text#hello
```

例えばこの例では `hello` がフラグメントです。

JavaScriptでは [`location.hash`](https://developer.mozilla.org/ja/docs/Web/API/Location/hash) でフラグメントを取得できます。

## オリジン (Origin)

スキーム・ホスト・ポートをまとめて扱うことがあります。
具体的にはセキュリティ上の理由から送信元の同一性を判定するケースです。
このとき使われるのが「オリジン」です。

```
https://localhost:8000/search?q=text#hello
```

例えばこの例では (`https`, `localhost`, `8000`) の3つの組がオリジンです。
オリジンは `https://localhost:8000` のように表現します。

JavaScriptでは [`location.origin`](https://developer.mozilla.org/ja/docs/Web/API/Location/origin) でオリジンを取得できます。

> **Note**\
> Webブラウザーのセキリティ機構
>
> Webブラウザーには[同一オリジンポリシー](https://developer.mozilla.org/ja/docs/Web/Security/Same-origin_policy)と呼ばれる保護機構があり、オリジン間のアクセスは原則禁止されています。
> 異なるオリジン間でのアクセスを許可するには、[オリジン間リソース共有 (Cross-Origin Resource Sharing, CORS)](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS) の仕組みを使います。
> CORSはリソースを提供する人が同一オリジンポリシーを緩和しオリジン間のアクセスを許可するための仕組みです。

## ポイント

- URLはインターネット上のリソースの位置を特定するための識別子
- `https://` から始まるURLは `https` スキームのURL
- `https` スキームのURLはホスト、ポート、パス、クエリー、フラグメントによって構成されている
