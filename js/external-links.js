"use strict";

// 外部リンクを新しいブラウザーコンテキストで開く
document.querySelectorAll(`a[href^="https://"]`).forEach((a) => {
  a.target = "_blank";
  a.rel = "noreferrer";
});
