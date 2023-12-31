# 非同期処理

[JavaScript Primer > 基本文法 > 非同期処理:Promise/Async Function](https://jsprimer.net/basic/async/)

この章ではJavaScriptの非同期処理について学んでいきます。
非同期処理はJavaScriptにおけるとても重要な概念です。
また、ブラウザやNode.jsなどのAPIには非同期処理でしか扱えないものもあるため、非同期処理を避けることはできません。
JavaScriptには非同期処理を扱うためのPromiseというビルトインオブジェクト、さらにはAsync Functionと呼ばれる構文的なサポートがあります。

この章では非同期処理とはどのようなものかという話から、非同期処理での例外処理、非同期処理の扱い方を見ていきます。

> ― この文章は © 2023 jsprimer project クリエイティブ・コモンズ [CC BY 4.0](https://github.com/asciidwango/js-primer/blob/master/LICENSE-CC-BY) ライセンスのもとに利用を許諾されています。

続きは [JavaScript Primer > 基本文法 > 非同期処理:Promise/Async Function](https://jsprimer.net/basic/async/) を参照しましょう。

## ポイント

- 非同期処理はその処理が終わるのを待つ前に次の処理を評価すること
- Async Function … `async function f() { <この中にawait式を書ける>; }`
  - Async Function は非同期処理を行う関数
  - `await` 式は Async Function の中で利用できる
- `await` 式
  - 構文: `await f()`
  - 意味: `await` 式は Async Function `f()` が完了するまで待つ

## やってみよう！

<!-- prettier-ignore -->
<div class="codepen" data-prefill data-editable data-default-tab="js,result" data-height="480">

<pre data-lang="js">
const button = document.createElement("button");
button.textContent = "スタート";
document.body.append(button);

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

button.addEventListener("click", async function () {
  await sleep(10000); // ms

  document.body.append("10秒!");
});
</pre>
</div>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
