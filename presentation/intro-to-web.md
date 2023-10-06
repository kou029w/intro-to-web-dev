---
marp: true
paginate: true
---

# Web概論

WebDINO Japan シニアエンジニア
[渡邉浩平](https://github.com/kou029w)
![w:200](https://github.com/kou029w.png)

---

# Web

Webとは何か

![bg right:66%](../web/assets/world-wide-web.png)

<!-- 当たり前のように使われているが、そもそもWebとは何だろう -->

<!-- _footer: 画像: https://worldwideweb.cern.ch/browser/ -->

<!-- 最初のWebブラウザーとされているソフトウェアの画像 -->

---

# World Wide Web

1989-1990年: 欧州原子核研究機構（CERN）Tim Berners-Leeらによって開発
https://worldwideweb.cern.ch/timeline/

「分散型ハイパーテキストシステム」として提案したアイデア
[The original proposal of the WWW, HTMLized](https://www.w3.org/History/1989/proposal.html)

インターネットを介して相互にメディアが結び付く分散型の情報処理システム

---

# Webブラウザー

<!-- TODO: 最近のウェブブラウザーのアイコンが並んでいる図 -->

Webページの取得・描画、Webアプリケーションの実行を行うソフトウェア

---

# プラットフォームとしてのWeb

![](../web/assets/web-apps.dio.png)

Webアプリケーションのプラットフォームとして多目的化・多機能化が進展

---

# Webの標準化

主に3つの標準化団体が関わっている

- [IETF (Internet Engineering Task Force)](https://www.ietf.org/)
- [W3C (The World Wide Web Consortium)](https://www.w3.org/)
- [WHATWG (Web Hypertext Application Technology Working Group)](https://whatwg.org/)

いずれも、Web上で公開されている

無償で閲覧可能、誰でも参加可能、自由に実装可能

---

# Webの基本構成要素

- [HTML](https://developer.mozilla.org/ja/docs/Glossary/HTML) … Webページの構造を指定する記述言語
- [HTTP](https://developer.mozilla.org/ja/docs/Glossary/HTTP) … Webの転送用のプロトコル
- [URL](https://developer.mozilla.org/ja/docs/Glossary/URL) … インターネット上のリソースの位置を特定するための文字列

---

# ここまでのまとめ

- Web … 分散型ハイパーテキストシステム
- Webブラウザー … Webページの取得・描画、Webアプリケーションの実行
- Webの標準化 … 無償で閲覧可能、誰でも参加可能、自由に実装可能
- Webの基本構成要素 … URL/HTTP/HTML

---

## ![h:0.8em][github.svg] フィードバック

[このスライドを編集する](https://github.com/kou029w/intro-to-web-dev/edit/main/presentation/intro-to-web.md) / [問題を報告する](https://github.com/kou029w/intro-to-web-dev/issues/new)

[github.svg]: https://cdnjs.cloudflare.com/ajax/libs/simple-icons/9.8.0/github.svg

---

<script>
window.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("a")?.forEach(function (a) {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noreferrer");
  });
});
</script>
<style>
footer {
  overflow-wrap: anywhere;
}
</style>
