const statusEl = document.querySelector("#status");
const formEl = document.querySelector("#form");
const wordEl = document.querySelector("#word");
const resultEl = document.querySelector("#result");

if (!("LanguageModel" in self)) {
  statusEl.textContent =
    "この環境ではLanguageModelを利用できません。Chrome 148以降でお試しください。";
  formEl.hidden = true;
} else if ((await LanguageModel.availability()) === "unavailable") {
  statusEl.textContent = "この端末ではPrompt APIを利用できません。";
  formEl.hidden = true;
} else {
  statusEl.textContent = "単語を入力して検索してください。";
}

let baseSession;

async function getBaseSession() {
  if (!baseSession) {
    baseSession = await LanguageModel.create({
      initialPrompts: [
        {
          role: "system",
          content:
            "あなたは日本語の類語辞典です。入力された単語の類義語だけを箇条書きで返します。前置きや説明は不要です。",
        },
        { role: "user", content: "「面白い」の類義語を挙げてください。" },
        {
          role: "assistant",
          content: "- 愉快\n- 楽しい\n- 興味深い\n- 滑稽\n- 痛快",
        },
      ],
    });
  }
  return baseSession;
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const word = wordEl.value.trim();
  if (!word) {
    return;
  }

  statusEl.textContent = "検索中…";
  resultEl.textContent = "";

  const base = await getBaseSession();
  const session = await base.clone();
  const stream = session.promptStreaming(`「${word}」の類義語を挙げてください。`);

  for await (const chunk of stream) {
    resultEl.textContent += chunk;
  }
  session.destroy();
  statusEl.textContent = "完了しました。";
});
