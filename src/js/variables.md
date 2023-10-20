# 変数と宣言

[JavaScript Primer > 基本文法 > 変数と宣言](https://jsprimer.net/basic/variables/)

プログラミング言語には、文字列や数値などのデータに名前をつけることで、繰り返し利用できるようにする**変数**という機能があります。

JavaScriptには「これは変数です」という宣言をするキーワードとして、
`const`、`let`、`var`の3つがあります。

`var`はもっとも古くからある変数宣言のキーワードですが、意図しない動作を作りやすい問題が知られています。
そのためECMAScript 2015で、`var`の問題を改善するために`const`と`let`という新しいキーワードが導入されました。

この章では`const`、`let`、`var`の順に、それぞれの方法で宣言した変数の違いについて見ていきます。

> ― この文章は © 2023 jsprimer project クリエイティブ・コモンズ [CC BY 4.0](https://github.com/asciidwango/js-primer/blob/master/LICENSE-CC-BY) ライセンスのもとに利用を許諾されています。

続きは [JavaScript Primer > 基本文法 > 変数と宣言](https://jsprimer.net/basic/variables/) を参照しましょう。

## ポイント

- `const`は、再代入できない変数を宣言できる
- `let`は、再代入ができる変数を宣言できる

## やってみよう！

<!-- prettier-ignore -->
<div class="codepen" data-prefill data-editable data-default-tab="js,result" data-height="480">

<pre data-lang="js">
// 真空の光速度 (m/s)
const c = 299792458;

// 時間 (s)
let t = 0;

// 光の速度は変わらない
// c = 42;

// 時間は変わる
t = 0.001;

document.body.textContent = `${t} 秒間に光の進む距離: ${c * t} m`;
</pre>
</div>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
