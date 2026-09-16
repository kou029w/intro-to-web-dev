const statusEl = document.querySelector("#status");
const formEl = document.querySelector("#form");
const fileEl = document.querySelector("#file");
const previewEl = document.querySelector("#preview");
const promptEl = document.querySelector("#prompt");
const outputEl = document.querySelector("#output");

if (
  !("LanguageModel" in self) ||
  (await LanguageModel.availability()) === "unavailable"
) {
  statusEl.textContent =
    "この環境ではPrompt APIを利用できません。Chrome 148以降でお試しください。";
  formEl.hidden = true;
} else {
  statusEl.textContent = "準備完了です。";
}

fileEl.addEventListener("change", () => {
  const file = fileEl.files[0];
  previewEl.src = file ? URL.createObjectURL(file) : "";
  previewEl.hidden = !file;
});

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = fileEl.files[0];
  if (!file) {
    return;
  }

  statusEl.textContent = "モデルを準備しています…";
  const session = await LanguageModel.create({
    expectedInputs: [{ type: "text" }, { type: "image" }],
  });

  statusEl.textContent = "画像を確認しています…";
  outputEl.textContent = "";
  const stream = session.promptStreaming([
    {
      role: "user",
      content: [
        { type: "text", value: promptEl.value },
        { type: "image", value: file },
      ],
    },
  ]);
  for await (const chunk of stream) {
    outputEl.textContent += chunk;
  }

  session.destroy();
  statusEl.textContent = "完了しました。";
});
