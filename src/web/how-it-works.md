# Webの仕組み

Webの誕生から現在に至るまでWeb上で出来ることやその役割は大きく変わりました。
しかし、それを支える基本的な仕組みと構成要素は実はあまり変わっていません。

Webはこれらの要素に支えられています。

- [URL](url.md) … インターネット上のリソースの位置を特定するための識別子
- [HTTP](http.md) … Webの転送用のプロトコル
- コンテンツ … Webページなど

> **Note**\
> 変わり続けるルール
>
> 多くのルールを覚えることは決して重要ではありません。
> なぜなら現実の問題は複雑でそれに合わせてルールも変わり続けていくものだからです。
> 大切なのは解決したい問題への理解を深めていくことなのです。
> 何を解決するためのルールなのか一緒に考えていきましょう。(この後も退屈な説明が続きますがどうかお付き合いください。)
>
> - [URL Living Standard (URLの仕様)](https://url.spec.whatwg.org/)
> - [HTML Living Standard (HTMLの仕様)](https://html.spec.whatwg.org/multipage/)
> - [ECMAScript (JavaScriptの仕様)](https://jsprimer.net/basic/ecmascript/)
>
> 例えばこれらの仕様はいずれも常に最新版の標準仕様となっており継続的に更新され続けています。

## Webページ

<!-- prettier-ignore-start -->
> ![](https://developer.mozilla.org/ja/docs/Learn/JavaScript/First_steps/What_is_JavaScript/cake.png)\
> _― 画像: [JavaScript とは - ウェブ開発を学ぶ | MDN](https://developer.mozilla.org/ja/docs/Learn/JavaScript/First_steps/What_is_JavaScript) より_
<!-- prettier-ignore-end -->

Webページはこれらの要素に支えられています。

- [HTML](html.md) … Webページの構造を記述するための言語
- CSS … Webページの見た目を記述するための言語
- JavaScript … プログラミング言語

## ポイント

- Web … URL/HTTP/コンテンツ
- Webページ … HTML/CSS/JavaScript

## 参考文献

- [HTML 入門 - ウェブ開発を学ぶ | MDN](https://developer.mozilla.org/ja/docs/Learn/HTML/Introduction_to_HTML)
  - HTMLの基本的な概念や文法を学ぶことができます
  - この他にもMDNはWeb技術のリファレンスとして参考にしています
- [太田 良典、中村 直樹「HTML解体新書」](https://www.borndigital.co.jp/book/25999.html)
  - HTMLの基本概念の説明を参考にしています
- [渋川よしき「Real World HTTP 第2版」](https://www.oreilly.co.jp//books/9784873119038/)
  - HTTPの技術的な説明の参考にしています
  - [渋川よしき「Real World HTTP ミニ版」](https://www.oreilly.co.jp/books/9784873118789/)は無料で読めるのでお手軽です
- [Dev.Opera — HTTP — an Application-Level Protocol](https://dev.opera.com/articles/http-basic-introduction/)
  - HTTPの概要を説明するために参考にしています
- [米内貴志「Webブラウザセキュリティ」](https://www.lambdanote.com/products/wbs)
  - Webブラウザーのセキリティ機構の説明を参考にしています
