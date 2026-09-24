const statusEl = document.querySelector("#status");
const connectEl = document.querySelector("#connect");
const explainEl = document.querySelector("#explain");
const promptEl = document.querySelector("#prompt");
const levelEl = document.querySelector("#level");
const commentEl = document.querySelector("#comment");

const WINDOW_SIZE = 30; // 100ms間隔で約3秒分
const samples = [];
let latest;
let port;
let writer;

const LEVEL_LABELS = { normal: "正常", warning: "注意", alert: "警告" };

const schema = {
  type: "object",
  properties: {
    comment: { type: "string" },
    level: { type: "string", enum: ["normal", "warning", "alert"] },
  },
  required: ["comment", "level"],
};

let baseSessionPromise;

// 同時に呼ばれてもセッションを1つだけ作るよう、Promiseを使い回す
function getBaseSession() {
  baseSessionPromise ??= LanguageModel.create({
    initialPrompts: [
      {
        role: "system",
        content:
          "あなたは机の上に置いた計測装置の見守り担当です。センサーの集計から装置の状態を判断し、担当者向けに50文字以内でコメントします。levelは、普段どおりならnormal、様子を見るべきならwarning、すぐに確認が必要ならalertにします。",
      },
    ],
  }).catch((error) => {
    baseSessionPromise = undefined;
    throw error;
  });
  return baseSessionPromise;
}

if (!("serial" in navigator) || !("LanguageModel" in self)) {
  statusEl.textContent =
    "この環境ではWeb Serial APIまたはPrompt APIを利用できません。Chrome 148以降でお試しください。";
  connectEl.hidden = true;
} else if ((await LanguageModel.availability()) === "unavailable") {
  statusEl.textContent = "この端末ではPrompt APIを利用できません。";
  connectEl.hidden = true;
} else {
  statusEl.textContent = "M5StackをUSBで接続し、「接続」を押してください。";
  // ダウンロード済みなら、ボタンを押す前にセッションを用意しておく
  if ((await LanguageModel.availability()) === "available") getBaseSession();
}

function magnitude([x, y, z]) {
  return Math.hypot(x, y, z);
}

function describeTilt(degrees) {
  if (degrees < 10) return "ほぼ水平";
  if (degrees < 45) return "少し傾いている";
  if (degrees < 135) return "大きく傾いている";
  return "裏返し";
}

function describeShake(deviation) {
  if (deviation < 0.02) return "静止";
  if (deviation < 0.1) return "小さな揺れ";
  return "大きな揺れ";
}

// 生の数値の列を、モデルが解釈しやすい集計とラベルに変換する
function summarize() {
  const mean = [0, 1, 2].map(
    (axis) =>
      samples.reduce((sum, s) => sum + s.accel[axis], 0) / samples.length,
  );
  const tilt = (Math.acos(mean[2] / magnitude(mean)) * 180) / Math.PI;

  const magnitudes = samples.map((s) => magnitude(s.accel));
  const average = magnitudes.reduce((sum, m) => sum + m, 0) / magnitudes.length;
  const deviation = Math.sqrt(
    magnitudes.reduce((sum, m) => sum + (m - average) ** 2, 0) /
      magnitudes.length,
  );
  const gyroMax = Math.max(...samples.map((s) => magnitude(s.gyro)));
  const freeFall = Math.min(...magnitudes) < 0.3;

  const seconds = (samples.at(-1).time - samples[0].time) / 1000;

  return [
    `直近${seconds.toFixed(1)}秒間のセンサーの集計です。`,
    `- 傾き: ${tilt.toFixed(0)}度（${describeTilt(tilt)}）`,
    `- 揺れ: 標準偏差${deviation.toFixed(3)}G（${describeShake(deviation)}）`,
    `- 回転: 最大${gyroMax.toFixed(0)}度/秒`,
    `- 自由落下に近い瞬間: ${freeFall ? "あり" : "なし"}`,
    `- バッテリー: ${latest.battery}%（${
      latest.charging ? "充電中" : "充電していない"
    }）`,
  ].join("\n");
}

let busy = false;

async function explain() {
  if (busy || samples.length === 0) return;
  busy = true;
  explainEl.disabled = true;
  statusEl.textContent = "モデルが判断しています…";

  try {
    const summary = summarize();
    promptEl.textContent = summary;

    const base = await getBaseSession();
    const session = await base.clone();
    const result = JSON.parse(
      await session.prompt(summary, { responseConstraint: schema }),
    );
    session.destroy();

    levelEl.className = result.level;
    levelEl.textContent = LEVEL_LABELS[result.level];
    commentEl.textContent = result.comment;
    statusEl.textContent = "完了しました。";
  } catch (error) {
    statusEl.textContent = `エラーが発生しました: ${error.message}`;
  }

  busy = false;
  explainEl.disabled = false;
}

function handleMessage(message) {
  if (message?.type === "sensor") {
    latest = message;
    samples.push(message);
    if (samples.length > WINDOW_SIZE) samples.shift();
  } else if (message?.type === "button" && message.name === "A") {
    explain();
  }
}

async function readLines(onLine) {
  const reader = port.readable.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) onLine(line.trim());
    }
  } catch (error) {
    statusEl.textContent = `受信を中断しました: ${error.message}`;
  } finally {
    reader.releaseLock();
  }
}

function handleLine(line) {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    return; // JSONでない行は無視する
  }
  handleMessage(message);
}

connectEl.addEventListener("click", async () => {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
  } catch (error) {
    statusEl.textContent = `接続できませんでした: ${error.message}`;
    return;
  }

  writer = port.writable.getWriter();
  // 別のページでセンサー値の送信を止めていても、ここで再開させる
  writer.write(new TextEncoder().encode("sensor on\n"));
  connectEl.disabled = true;
  explainEl.disabled = false;
  statusEl.textContent =
    "接続しました。M5Stackを傾けたり揺らしたりしてから、説明させてみましょう。";

  await readLines(handleLine);

  writer.releaseLock();
  await port.close().catch(() => {});
  connectEl.disabled = false;
  explainEl.disabled = true;
  statusEl.textContent = "切断されました。";
});

explainEl.addEventListener("click", explain);
