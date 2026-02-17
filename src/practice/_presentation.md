---
marp: true
paginate: true
---

# 開発実践 〜アイディアを形に〜

WebDINO Japan エンジニア
[渡邉浩平](https://scrapbox.io/intro-to-web-dev/watanabe)

---

## タイムテーブル

- 10:00–10:15 オープニング
- 〜開発〜
- 15:30 成果発表
  - 概要紹介・デモ
  - 一人あたり4〜5分程度
  - ポイント: **実際に動くこと** (部分的にはモックでも全然OK 👌)
- 16:45 クロージング
- 17:00 解散

---

## 複数のHTMLページを持つアプリを作りたい方へ

通常 `vite.config.ts` は `index.html` のみをビルド対象にしています。

---

## マルチページアプリの作り方

`web/` 以下に HTML ファイルを追加

```
web/
├── index.html        ← トップページ
├── list.html         ← 一覧ページ
└── detail.html       ← 詳細ページ
```

※ あくまで一例です。ファイル構成は自由に決めてOK。

<!-- _footer: ご参考まで: 詳細は [todo-template PR #1](https://github.com/kou029w/todo-template/pull/1) をご確認ください。 -->

---

## マルチページアプリの作り方

`web/vite.config.ts` を変更してすべての HTML を自動検出

```typescript
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs/promises"; // ファイルシステム操作 (非同期版)
import { defineConfig } from "vite";

// **/*.html にマッチするすべての HTML ファイルをエントリーポイントとして収集
const entrypoints = [];
for await (const html of fs.glob("**/*.html", {
  cwd: import.meta.dirname, // このファイルのディレクトリを起点に検索
  exclude: ["node_modules/**", "dist/**"], // 依存関係とビルド成果物は除外
})) {
  entrypoints.push(html);
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: entrypoints, // 収集した全 HTML をビルド対象に指定
    },
  },
});
```

<!-- _class: small-code -->

---

## 開発実践のポイント

- **間違えよう**: たくさん試して、たくさん間違えよう
- **プランB歓迎**: 最初の計画に縛られすぎず、作り始めてから変えていこう
- **自分の言葉で説明してみよう**: 他の人やAIに説明してみると理解が深まる

迷ったら、**一番ワクワクするもの**を選びましょう。

---

## 成果発表

- 概要紹介・デモ
- 一人あたり4〜5分程度
- ポイント: **実際に動くこと** (部分的にはモックでも全然OK 👌)

---

## Webの標準化

Webの仕様は標準化団体によって管理されています。

- [IETF](https://www.ietf.org/) — インターネット全般の技術標準 (RFC)
- [W3C](https://www.w3.org/) — CSS など
- [WHATWG](https://whatwg.org/) — HTML など ([HTML Living Standard](https://html.spec.whatwg.org/multipage/))

Webは**無償公開**、**誰でも参加可能**、**自由に実装可能**なオープンなプラットフォームです。
みなさまもぜひ、Webの未来を一緒に作っていきましょう！

---

## アイディアを形に

> **"This is for everyone"**
>
> _― [Tim Berners-Lee (@timberners_lee)](https://twitter.com/timberners_lee/status/228960085672599552)_

---

## フィードバック

[このスライドを編集する](https://github.com/kou029w/intro-to-web-dev/edit/main/src/practice/_presentation.md) / [問題を報告する](https://github.com/kou029w/intro-to-web-dev/issues/new)

<script type="module">
document.querySelectorAll("a").forEach(function (a) {
  Object.assign(a, {
    target: "_blank",
    rel: "noreferrer",
  });
});

const slides = document.querySelectorAll("section");
const total = slides.length;

function currentSlide() {
  const n = parseInt(location.hash.replace("#", ""), 10);
  return isNaN(n) || n < 1 ? 1 : Math.min(n, total);
}

function goTo(n) {
  location.hash = `#${n}`;
}

document.addEventListener("keydown", function (e) {
  switch (e.key) {
    case "ArrowRight":
    case "ArrowDown":
    case "PageDown":
    case " ":
      if (!e.shiftKey) {
        e.preventDefault();
        goTo(Math.min(currentSlide() + 1, total));
        break;
      }
    case "ArrowLeft":
    case "ArrowUp":
    case "PageUp":
      e.preventDefault();
      goTo(Math.max(currentSlide() - 1, 1));
      break;
  }
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700&family=Zen+Maru+Gothic:wght@500;700&display=swap");

:root {
  --bg: #fffaf0;
  --ink: #1f2a44;
  --sun: #ffd54f;
  --sky: #90caf9;
  --leaf: #a5d6a7;
  --coral: #ff8a65;
}

section {
  font-family: "Zen Maru Gothic", "Baloo 2", sans-serif;
  color: var(--ink);
  background:
    radial-gradient(circle at 8% 12%, rgba(255, 213, 79, 0.35) 0 180px, transparent 181px),
    radial-gradient(circle at 92% 18%, rgba(144, 202, 249, 0.35) 0 160px, transparent 161px),
    radial-gradient(circle at 12% 85%, rgba(165, 214, 167, 0.35) 0 170px, transparent 171px),
    radial-gradient(circle at 88% 88%, rgba(255, 138, 101, 0.35) 0 150px, transparent 151px),
    repeating-linear-gradient(45deg, rgba(31, 42, 68, 0.03) 0 8px, rgba(31, 42, 68, 0.01) 8px 16px),
    var(--bg);
  padding: 0 1.25rem;
}

section :is(h1, h2, h3, h4, h5, h6) {
  border-bottom: 0.5rem solid var(--sun);
  display: inline-block;
  padding: 0 0.75rem 0.125rem;
  border-radius: 0.625rem;
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0.25rem 0.25rem 0 rgba(31, 42, 68, 0.15);
  line-height: 1.2;
}

h1 {
  font-size: 2.2rem;
}

h2 {
  font-size: 1.6rem;
}

p,
li {
  font-size: 1rem;
}

a, a:visited {
  color: #0b75cb;
}

section strong {
  background: linear-gradient(transparent 60%, rgba(255, 213, 79, 0.7) 60%);
  padding: 0 0.25rem;
}

section blockquote {
  border-left: 0.5rem solid var(--sky);
  background: rgba(144, 202, 249, 0.15);
  padding: 0.875rem 1.125rem;
  border-radius: 0.75rem;
  box-shadow: 0.1875rem 0.25rem 0 rgba(31, 42, 68, 0.12);
}

section code {
  background: rgba(255, 255, 255, 0.9);
  border: 0.125rem dashed rgba(31, 42, 68, 0.2);
  border-radius: 0.5rem;
  padding: 0.125rem 0.375rem;
  vertical-align: baseline;
}

section pre {
  border: 0.1875rem solid rgba(31, 42, 68, 0.12);
  border-radius: 1rem;
  box-shadow: 0.25rem 0.375rem 0 rgba(31, 42, 68, 0.15);
  background: rgba(255, 255, 255, 0.92);
  line-height: 1.35;
  font-size: 0.85rem;
}

section.small-code pre {
  font-size: 0.65rem;
  line-height: 1.25;
}
</style>
