import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm@0.2.85";

const statusEl = document.querySelector("#status");
const formEl = document.querySelector("#form");
const inputEl = document.querySelector("#input");
const generateEl = document.querySelector("#generate");
const stopEl = document.querySelector("#stop");
const outputEl = document.querySelector("#output");

const adapter = await navigator.gpu?.requestAdapter();
if (!adapter) {
  statusEl.textContent =
    "WebGPUを利用できません。WebGPU対応ブラウザでHTTPSまたはlocalhostから開いてください。";
} else {
  statusEl.textContent =
    "WebGPUを利用できます。初回はモデル（GB単位）をダウンロードします。";
  generateEl.disabled = false;
}

let engine;

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  generateEl.disabled = true;
  outputEl.textContent = "";

  try {
    engine ??= await CreateMLCEngine("Qwen3.5-2B-q4f32_1-MLC", {
      initProgressCallback: ({ text }) => (statusEl.textContent = text),
    });

    statusEl.textContent = "要約を生成しています…";
    stopEl.disabled = false;
    const stream = await engine.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "入力文を日本語で2文に要約してください。入力にない情報は補わず、要約だけを出力してください。",
        },
        { role: "user", content: inputEl.value },
      ],
      max_tokens: 256,
      temperature: 0.2,
      extra_body: { enable_thinking: false },
      stream: true,
    });

    let text = "";
    for await (const chunk of stream) {
      text += chunk.choices[0]?.delta.content ?? "";
      // 先頭に付く空の<think>...</think>を除いて表示する
      outputEl.textContent = text.replace(
        /^<think>[\s\S]*?(<\/think>\s*|$)/,
        "",
      );
    }
    statusEl.textContent = "完了しました。";
  } catch (error) {
    statusEl.textContent = `エラー: ${error.message}`;
  } finally {
    generateEl.disabled = false;
    stopEl.disabled = true;
  }
});

stopEl.addEventListener("click", () => engine?.interruptGenerate());
