const statusEl = document.querySelector("#status");
const chatEl = document.querySelector("#chat");
const formEl = document.querySelector("#form");
const messageEl = document.querySelector("#message");

const CITY_COORDS = {
  東京: { latitude: 35.6812, longitude: 139.7671 },
  大阪: { latitude: 34.6937, longitude: 135.5023 },
  札幌: { latitude: 43.0618, longitude: 141.3545 },
};

function describeWeatherCode(code) {
  if (code === 0) return "快晴";
  if (code <= 3) return "薄曇りから曇り";
  if (code <= 48) return "霧";
  if (code <= 67) return "雨";
  if (code <= 77) return "雪";
  if (code <= 82) return "にわか雨";
  return "雷雨";
}

async function getWeather({ city }) {
  const coords = CITY_COORDS[city];
  if (!coords) {
    throw new Error(`${city}の座標情報を持っていません。`);
  }
  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    current: "temperature_2m,weather_code",
  });
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
  );
  const { current } = await response.json();
  return {
    city,
    temperatureCelsius: current.temperature_2m,
    weather: describeWeatherCode(current.weather_code),
  };
}

const tools = [
  {
    name: "get_weather",
    description:
      "指定した日本の都市の現在の気温と天気を取得します。対応都市は東京、大阪、札幌です。",
    inputSchema: {
      type: "object",
      properties: { city: { type: "string" } },
      required: ["city"],
    },
    execute: getWeather,
  },
];

const toolUseSupported =
  "LanguageModelToolCall" in self &&
  "LanguageModelToolSuccess" in self &&
  "LanguageModelToolError" in self;

let session;

if (!("LanguageModel" in self) || !toolUseSupported) {
  statusEl.textContent =
    "この環境ではツール呼び出しを利用できません。ツール呼び出しは実験的な機能のため、Chromeのフラグ有効化が必要な場合があります。";
  formEl.hidden = true;
} else if ((await LanguageModel.availability({ tools })) === "unavailable") {
  statusEl.textContent = "この端末ではPrompt APIを利用できません。";
  formEl.hidden = true;
} else {
  statusEl.textContent = "準備完了です。質問してみてください。";
}

function appendMessage(role, text) {
  const p = document.createElement("p");
  p.textContent = `${role === "user" ? "あなた" : role === "assistant" ? "AI" : "system"}: ${text}`;
  chatEl.append(p);
}

function appendToolCall(name, args, result) {
  const p = document.createElement("p");
  p.className = "tool-call";
  p.textContent = `⚙ ${name}(${JSON.stringify(args)}) → ${JSON.stringify(result)}`;
  chatEl.append(p);
}

async function ensureSession() {
  if (!session) {
    session = await LanguageModel.create({
      tools: tools.map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema,
      })),
    });
  }
  return session;
}

async function runStream(input) {
  const currentSession = await ensureSession();
  let text = "";
  const calls = [];
  for await (const chunk of currentSession.promptStreaming(input)) {
    if (typeof chunk === "string") {
      text += chunk;
    } else if (chunk.type === "tool-call") {
      calls.push(chunk.value);
    }
  }
  return { text, calls };
}

const MAX_ROUNDS = 4;

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = messageEl.value.trim();
  if (!question) {
    return;
  }
  messageEl.value = "";
  appendMessage("user", question);

  statusEl.textContent = "考えています…";
  let { text, calls } = await runStream(question);
  if (text) {
    appendMessage("assistant", text);
  }

  let round = 0;
  while (calls.length) {
    if (++round > MAX_ROUNDS) {
      appendMessage("system", "ツール呼び出しの回数上限に達しました。");
      break;
    }

    const responses = [];
    for (const call of calls) {
      const tool = tools.find((candidate) => candidate.name === call.name);
      try {
        const result = await tool.execute(call.arguments);
        appendToolCall(call.name, call.arguments, result);
        responses.push({
          type: "tool-response",
          value: new LanguageModelToolSuccess({
            callID: call.callID,
            name: call.name,
            result: [{ type: "object", value: result }],
          }),
        });
      } catch (error) {
        appendToolCall(call.name, call.arguments, { error: String(error) });
        responses.push({
          type: "tool-response",
          value: new LanguageModelToolError({
            callID: call.callID,
            name: call.name,
            errorMessage: String(error),
          }),
        });
      }
    }

    statusEl.textContent = "考えています…";
    ({ text, calls } = await runStream([
      { role: "user", content: responses },
    ]));
    if (text) {
      appendMessage("assistant", text);
    }
  }

  statusEl.textContent = "準備完了です。質問してみてください。";
});
