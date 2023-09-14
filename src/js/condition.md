# 条件分岐

<a href="https://jsprimer.net/basic/condition/" target="_blank" rel="noreferrer">JavaScript Primer > 基本文法 > 条件分岐</a>

この章ではif文やswitch文を使った条件分岐について学んでいきます。
条件分岐を使うことで、特定の条件を満たすかどうかで行う処理を変更できます。

> ― この文章は © 2023 jsprimer project クリエイティブ・コモンズ [CC BY 4.0](https://github.com/asciidwango/js-primer/blob/master/LICENSE-CC-BY) ライセンスのもとに利用を許諾されています。

続きは <a href="https://jsprimer.net/basic/condition/" target="_blank" rel="noreferrer">JavaScript Primer > 基本文法 > 条件分岐</a> を参照しましょう。

## ポイント

- if文
- switch文、case節、default節

![](assets/condition.dio.png)

<a href="https://dorey.github.io/JavaScript-Equality-Table/" target="_blank" rel="noreferrer">![](assets/if-statement.png)</a>

## やってみよう！

<!-- prettier-ignore -->
<div class="codepen" data-prefill data-editable data-default-tab="js,result" data-height="480">

<pre data-lang="js">
let color = "white";

if (Math.random() < 0.5) {
  color = "green";
}

document.body.style.backgroundColor = color;
document.body.textContent = `今日のラッキーカラー: ${color}`;
</pre>
</div>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

- <a href="https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math" target="_blank" rel="noreferrer">Math - JavaScript | MDN</a>
  - `Math.random()`は`0`以上`1`未満の疑似乱数を返します。
