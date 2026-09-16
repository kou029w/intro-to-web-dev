const statusEl = document.querySelector("#status");
const usageEl = document.querySelector("#usage");
const chatEl = document.querySelector("#chat");
const formEl = document.querySelector("#form");
const messageEl = document.querySelector("#message");
const compactButtonEl = document.querySelector("#compact");

if (
  !("LanguageModel" in self) ||
  (await LanguageModel.availability()) === "unavailable"
) {
  statusEl.textContent =
    "この環境ではPrompt APIを利用できません。Chrome 148以降でお試しください。";
  formEl.hidden = true;
  compactButtonEl.hidden = true;
} else {
  statusEl.textContent = "メッセージを送ってみてください。";
}

let session;
let history = [];

function appendMessage(role, text) {
  const p = document.createElement("p");
  p.textContent = `${role === "user" ? "あなた" : role === "assistant" ? "AI" : "system"}: ${text}`;
  chatEl.append(p);
  return p;
}

function updateUsage() {
  if (!session) {
    return;
  }
  const pct = Math.round((session.contextUsage / session.contextWindow) * 100);
  usageEl.textContent = `コンテキスト使用量: ${Math.round(session.contextUsage)} / ${Math.round(session.contextWindow)} トークン（${pct}%）`;
}

async function ensureSession() {
  if (!session) {
    session = await LanguageModel.create();
  }
  return session;
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = messageEl.value.trim();
  if (!message) {
    return;
  }
  messageEl.value = "";

  appendMessage("user", message);
  history.push({ role: "user", content: message });

  const currentSession = await ensureSession();
  const answerEl = appendMessage("assistant", "");
  const stream = currentSession.promptStreaming(message);
  let answer = "";
  for await (const chunk of stream) {
    answer += chunk;
    answerEl.textContent = `AI: ${answer}`;
  }
  history.push({ role: "assistant", content: answer });
  updateUsage();
});

compactButtonEl.addEventListener("click", async () => {
  if (!session || history.length === 0) {
    return;
  }

  statusEl.textContent = "会話を要約しています…";
  const transcript = history
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
  const summary = await session.prompt(
    `ここまでの会話を、後で参照できるように3文以内の日本語で要約してください。\n\n${transcript}`,
  );

  session.destroy();
  session = await LanguageModel.create({
    initialPrompts: [
      { role: "system", content: `これまでの会話の要約: ${summary}` },
    ],
  });
  history = [{ role: "system", content: summary }];

  appendMessage("system", `圧縮しました: ${summary}`);
  updateUsage();
  statusEl.textContent = "完了しました。";
});
