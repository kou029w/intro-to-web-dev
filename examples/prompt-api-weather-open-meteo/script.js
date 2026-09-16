const statusEl = document.querySelector("#status");
const formEl = document.querySelector("#form");
const placeEl = document.querySelector("#place");
const buttonEl = document.querySelector("#run");
const rawEl = document.querySelector("#raw");
const descriptionEl = document.querySelector("#description");
const judgmentEl = document.querySelector("#judgment");

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

function describeWeatherCode(code) {
  if (code === 0) return "快晴";
  if (code <= 3) return "薄曇りから曇り";
  if (code <= 48) return "霧";
  if (code <= 67) return "雨";
  if (code <= 77) return "雪";
  if (code <= 82) return "にわか雨";
  return "雷雨";
}

// 地名を緯度経度に変換する（Open-MeteoのジオコーディングAPI。APIキー不要）
// 「Tokyo」「Osaka」などのローマ字表記で検索し、日本語名で結果を受け取る
async function searchPlace(name) {
  const params = new URLSearchParams({ name, count: "1", language: "ja" });
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
  );
  const { results } = await response.json();
  return results?.[0] ?? null; // { name, latitude, longitude, country, admin1, ... }
}

async function fetchWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,weather_code,wind_speed_10m",
  });
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
  );
  const { current } = await response.json();
  return current;
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  buttonEl.disabled = true;
  rawEl.textContent = "";
  descriptionEl.textContent = "";
  judgmentEl.textContent = "";

  const query = placeEl.value.trim();

  statusEl.textContent = "場所を検索しています…";
  const place = await searchPlace(query);
  if (!place) {
    statusEl.textContent = `「${query}」は見つかりませんでした。Tokyo / Osaka / Kyoto のような地名で試してください。`;
    buttonEl.disabled = false;
    return;
  }
  const placeName = place.admin1 && place.admin1 !== place.name
    ? `${place.name}（${place.admin1}）`
    : place.name;

  statusEl.textContent = `${placeName}の気象データを取得しています…`;
  const current = await fetchWeather(place.latitude, place.longitude);
  const label = describeWeatherCode(current.weather_code);
  rawEl.textContent = JSON.stringify(current, null, 2);

  statusEl.textContent = "モデルを準備しています…";
  const session = await LanguageModel.create({
    initialPrompts: [
      {
        role: "system",
        content:
          "あなたは気象データをやさしい日本語で説明するアシスタントです。数値をそのまま読み上げるのではなく、一言コメントを添えてください。",
      },
    ],
  });

  statusEl.textContent = "説明を生成しています…";
  const stream = session.promptStreaming(
    `${placeName}の現在の気温は${current.temperature_2m}度、天気は${label}、風速は${current.wind_speed_10m}m/sです。`,
  );
  for await (const chunk of stream) {
    descriptionEl.textContent += chunk;
  }

  statusEl.textContent = "傘の要否を判定しています…";
  const schema = {
    type: "object",
    properties: {
      summary: { type: "string" },
      needsUmbrella: { type: "boolean" },
    },
    required: ["summary", "needsUmbrella"],
  };
  const result = await session.prompt(
    `${placeName}の現在の天気は${label}です。降水の有無を踏まえて傘が必要かを判定してください。`,
    { responseConstraint: schema },
  );
  const judgment = JSON.parse(result);
  judgmentEl.textContent = judgment.needsUmbrella
    ? `☂ 傘が必要です（${judgment.summary}）`
    : `☀ 傘は不要です（${judgment.summary}）`;

  session.destroy();
  statusEl.textContent = "完了しました。";
  buttonEl.disabled = false;
});
