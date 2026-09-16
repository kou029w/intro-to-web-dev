const statusEl = document.querySelector("#status");
const formEl = document.querySelector("#form");
const systemPromptEl = document.querySelector("#system-prompt");
const promptEl = document.querySelector("#prompt");
const schemaEl = document.querySelector("#schema");
const outputEl = document.querySelector("#output");

if (!("LanguageModel" in self)) {
  statusEl.textContent =
    "この環境ではLanguageModelを利用できません。Chrome 148以降でお試しください。";
  formEl.hidden = true;
} else {
  const availability = await LanguageModel.availability();
  if (availability === "unavailable") {
    statusEl.textContent = "この端末ではPrompt APIを利用できません。";
    formEl.hidden = true;
  } else {
    statusEl.textContent = `対応状況: ${availability}`;
  }
}

let session;

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();

  session?.destroy();

  const initialPrompts = systemPromptEl.value.trim()
    ? [{ role: "system", content: systemPromptEl.value.trim() }]
    : undefined;

  statusEl.textContent = "モデルを準備しています…";
  session = await LanguageModel.create({
    initialPrompts,
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        statusEl.textContent = `モデルをダウンロード中… ${Math.round(e.loaded * 100)}%`;
      });
    },
  });

  let responseConstraint;
  if (schemaEl.value.trim()) {
    try {
      responseConstraint = JSON.parse(schemaEl.value);
    } catch {
      statusEl.textContent = "JSON Schemaの形式が正しくありません。";
      return;
    }
  }

  statusEl.textContent = "生成中…";
  outputEl.textContent = "";
  const stream = session.promptStreaming(promptEl.value, {
    responseConstraint,
  });

  for await (const chunk of stream) {
    outputEl.textContent += chunk;
  }
  statusEl.textContent = "完了しました。";
});
