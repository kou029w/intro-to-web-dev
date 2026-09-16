const statusEl = document.querySelector("#status");
const buttonEl = document.querySelector("#run");
const rawEl = document.querySelector("#raw");
const descriptionEl = document.querySelector("#description");

if (
  !("LanguageModel" in self) ||
  (await LanguageModel.availability()) === "unavailable"
) {
  statusEl.textContent =
    "この環境ではPrompt APIを利用できません。Chrome 148以降でお試しください。";
  buttonEl.hidden = true;
} else {
  statusEl.textContent = "準備完了です。";
}

async function fetchTokyoWeather() {
  const response = await fetch("https://wttr.in/Tokyo?format=j1");
  const { current_condition } = await response.json();
  const [condition] = current_condition;
  return condition;
}

buttonEl.addEventListener("click", async () => {
  buttonEl.disabled = true;
  rawEl.textContent = "";
  descriptionEl.textContent = "";

  statusEl.textContent = "気象データを取得しています…";
  const condition = await fetchTokyoWeather();
  const description = condition.weatherDesc[0].value;
  rawEl.textContent = `気温: ${condition.temp_C}度\n天気: ${description}（英語表記）\n湿度: ${condition.humidity}%`;

  statusEl.textContent = "モデルを準備しています…";
  const session = await LanguageModel.create({
    initialPrompts: [
      {
        role: "system",
        content:
          "あなたは気象データをやさしい日本語で説明するアシスタントです。英語の天気表現は自然な日本語に訳し、数値をそのまま読み上げるのではなく一言コメントを添えてください。",
      },
    ],
  });

  statusEl.textContent = "説明を生成しています…";
  const stream = session.promptStreaming(
    `東京の現在の気温は${condition.temp_C}度、天気は英語で"${description}"、湿度は${condition.humidity}%です。`,
  );
  for await (const chunk of stream) {
    descriptionEl.textContent += chunk;
  }

  session.destroy();
  statusEl.textContent = "完了しました。";
  buttonEl.disabled = false;
});
