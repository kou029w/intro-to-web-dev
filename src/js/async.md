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
- `await` 式
  - 書式: `await 関数()`
  - 意味: `await` 式は Async Function `関数()` が完了するまで待つ
- Async Function … `async function 関数() { <awaitの含まれる文>; }`
  - 非同期処理を行う関数
  - `await` 式は Async Function の中で利用できる

## 一定時間待機

一定時間待機するAsync Function `sleep()` の作り方を解説します。

`setTimeout(<コールバック関数>, <ミリ秒>)` 関数は指定されたミリ秒後にコールバック関数を実行するための関数です。コールバック関数とは、簡単に言うと「後で使うために渡しておく関数」です。

- [setTimeout() - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/setTimeout)

次のコードは「3秒後にメッセージを表示する」という処理のプログラムです。メッセージの表示処理を `resolve()` 関数として宣言し、その関数名をコールバック関数として書きます。

```js
function resolve() {
  console.log("3秒!");
}

setTimeout(resolve, 3000); // 3秒 = 3,000ミリ秒
```

実行すると3秒後にメッセージ"3秒!"が表示されたかと思います。
これでも十分短いコードですが、今度はPromiseとawaitを使って書き換えてみます。

```js runnable
await new Promise((resolve) => setTimeout(resolve, 3000));
console.log("3秒!");
```

- 参考文献: [Promise - JavaScript | MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise)

こうすることで上から下へと順番に実行する処理順で書けます。
これにより時間がかかるようなプログラムをもっと簡単に読みやすく書くことができます。

> **Note**\
> 現実世界と非同期処理
>
> コンピューターの上ではどのようなタイミングで何を行うかプログラマーが自由に決めることができますが、現実の世界では同じ時刻でも様々な事象が常に起こっています。
> 私たちの日常生活は多くの非同期的なイベントで構成されていると言えます。
> 非同期処理の概念を理解しておくことは現実の問題をコンピューターの上で扱うのにとても役に立ちます。

関数を使用して指定されたミリ秒（ms）だけ待つように一般化してみましょう。
ここで `await` 式は通常の関数のなかでは利用できず、代わりにAsync Functionの中で利用できるという点に注意しましょう。

まとめるとこのようになります:

```js
async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
```

使用方法:

```js
await sleep(ミリ秒);
```

## インターネットからのデータの取得

インターネットからデータを取得する際にも、その処理が完了するまで待つ必要があります。

書式:

```js
let res = await fetch(取得するURL);
let data = await res.json();
```

最初の `await` 式でAPIからの応答を待ち、次に `res.json()` の処理の完了を待ちます。
このようにしてデータが完全に取得されるまでコードの実行が一時停止し、データが利用可能になると処理を再開します。

- 参考文献: [fetch() グローバル関数 - Web API | MDN](https://developer.mozilla.org/ja/docs/Web/API/fetch)

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
  await sleep(3000); // クリックしてから3秒待つ

  document.body.append("3秒!");
});
</pre>
</div>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
