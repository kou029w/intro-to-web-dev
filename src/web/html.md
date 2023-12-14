# HTML

HTMLはWebページの構造を記述するための言語です。

「どこに」「どのように」アクセスするかというと、Webでは「URLに」「HTTPで」アクセスするわけですね。
では一体「何を」Webブラウザーは見せているのでしょうか。
それは「HTML」です。(この入門ガイドもそうですよ。)

もともとHTMLは主に科学文書の意味や構造を正確に記述するための言語として設計されました。
現在では、あらゆる文書やアプリの記述に応用されています。

## 文法と意味

HTMLは[マークアップ言語 (Markup Language)](https://ja.wikipedia.org/wiki/%E3%83%9E%E3%83%BC%E3%82%AF%E3%82%A2%E3%83%83%E3%83%97%E8%A8%80%E8%AA%9E)と呼ばれるカテゴリーの言語です。
[HTMLの仕様](https://html.spec.whatwg.org/multipage/introduction.html#a-quick-introduction-to-html)から具体的なコードの例を挙げます。

例:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en">
 <head>
  <title>Sample page</title>
 </head>
 <body>
  <h1>Sample page</h1>
  <p>This is a <a href="demo.html">simple</a> sample.</p>
  <!-- this is a comment -->
 </body>
</html>
```
<!-- prettier-ignore-end -->

「タグ (Tag)」と呼ばれる<ruby>印<rt>マーク</rt></ruby>でコンテンツのかたまりを<ruby>囲みます<rt>マークアップします</rt></ruby>。
このかたまりは「要素 (Element)」と呼ばれます。

<!-- prettier-ignore-start -->
> ![](https://developer.mozilla.org/ja/docs/Learn/Getting_started_with_the_web/HTML_basics/grumpy-cat-small.png)\
> _― 画像: 「[HTML の基本](https://developer.mozilla.org/ja/docs/Learn/Getting_started_with_the_web/HTML_basics)」より_
<!-- prettier-ignore-end -->

要素の中に別の要素を含めることもあります。

```html
<p>This is a <a href="demo.html">simple</a> sample.</p>
```

この例では[&lt;p&gt;: 段落要素](https://developer.mozilla.org/ja/docs/Web/HTML/Element/p)の中に[&lt;a&gt;: アンカー要素](https://developer.mozilla.org/ja/docs/Web/HTML/Element/a)が含まれています。
リンクが含まれている文、その文を含む段落、という構造なわけです。

## やってみよう！

基本的なルールが分かってきたところで、さっそく遊んでみましょう！

<!-- prettier-ignore -->
<div class="codepen" data-prefill data-editable data-default-tab="html,result" data-height="480">

<pre data-lang="html">
&lt;p&gt;ここは段落なのですよ。&lt;/p&gt;

&lt;p&gt;HTMLを使えばインターネット上のあらゆるコンテンツに&lt;a href="https://kou029w.github.io/intro-to-web-dev/web/html.html"&gt;リンク&lt;/a&gt;できるのです。&lt;/p&gt;
</pre>
</div>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
