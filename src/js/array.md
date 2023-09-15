# 配列

[JavaScript Primer > 基本文法 > 配列](https://jsprimer.net/basic/array/)

配列はJavaScriptの中でもよく使われるオブジェクトです。

配列とは値に順序をつけて格納できるオブジェクトです。
配列に格納したそれぞれの値のことを**要素**、それぞれの要素の位置のことを**インデックス**（`index`）と呼びます。
インデックスは先頭の要素から`0`、`1`、`2`のように`0`からはじまる連番となります。

またJavaScriptにおける配列は可変長です。
そのため配列を作成後に配列へ要素を追加したり、配列から要素を削除できます。

この章では、配列の基本的な操作と配列を扱う場合においてのパターンについて学びます。

> ― この文章は © 2023 jsprimer project クリエイティブ・コモンズ [CC BY 4.0](https://github.com/asciidwango/js-primer/blob/master/LICENSE-CC-BY) ライセンスのもとに利用を許諾されています。

続きは [JavaScript Primer > 基本文法 > 配列](https://jsprimer.net/basic/array/) を参照しましょう。

## ポイント

- 配列は値に順序をつけて格納できるオブジェクト
- `[]`（配列リテラル）での配列の作成や更新方法

## やってみよう！

<!-- prettier-ignore -->
<div class="codepen" data-prefill data-editable data-default-tab="js,result" data-height="480">

<pre data-lang="js">
function drawFortune() {
  const fortunes = ["大吉", "中吉", "吉", "小吉", "凶", "大凶"];
  const i = Math.floor(Math.random() * fortunes.length);

  document.body.textContent = `あなたの運勢は... ${fortunes[i]}です！`;
}

drawFortune();
</pre>
</div>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

- [Math - JavaScript | MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math)
  - `Math.floor(x)`は`x`以下の最大の整数を返します。
  - `Math.random()`は`0`以上`1`未満の疑似乱数を返します。
