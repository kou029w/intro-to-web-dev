# 関数と宣言

<a href="https://jsprimer.net/basic/function-declaration/" target="_blank" rel="noreferrer">JavaScript Primer > 基本文法 > 関数と宣言</a>

関数とは、ある一連の手続き（文の集まり）を1つの処理としてまとめる機能です。
関数を利用することで、同じ処理を毎回書くのではなく、一度定義した関数を呼び出すことで同じ処理を実行できます。

これまで利用してきたコンソール表示をするConsole APIも関数です。
`console.log`は「受け取った値をコンソールへ出力する」という処理をまとめた関数です。

この章では、関数の定義方法や呼び出し方について見ていきます。

> ― この文章は © 2023 jsprimer project クリエイティブ・コモンズ [CC BY 4.0](https://github.com/asciidwango/js-primer/blob/master/LICENSE-CC-BY) ライセンスのもとに利用を許諾されています。

続きは <a href="https://jsprimer.net/basic/function-declaration/" target="_blank" rel="noreferrer">JavaScript Primer > 基本文法 > 関数と宣言</a> を参照しましょう。

## ポイント

- 関数の宣言方法

## やってみよう！

<!-- prettier-ignore -->
<div class="codepen" data-prefill data-editable data-default-tab="js,result" data-height="480">

<pre data-lang="js">
function 円の面積(r) {
  return Math.PI * r * r;
}

const r1 = 1;
const r2 = 3;

document.body.textContent = `
半径 ${r1} m の円の面積: ${円の面積(r1)} m²
半径 ${r2} m の円の面積: ${円の面積(r2)} m²
`;
</pre>
</div>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

`Math.PI`は円周率(およそ`3.14159`)を表す`Math`オブジェクトの静的プロパティです。

- <a href="https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math" target="_blank" rel="noreferrer">Math - JavaScript | MDN</a>
