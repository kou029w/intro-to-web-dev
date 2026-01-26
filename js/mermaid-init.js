"use strict";

async function renderMermaid() {
  const { default: mermaid } = await import(
    "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"
  );

  await mermaid.run({
    querySelector: "pre > code.language-mermaid",
  });

  document
    .querySelectorAll("pre:has(> code.language-mermaid) > .buttons")
    .forEach((el) => el.remove());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderMermaid);
} else {
  renderMermaid();
}
