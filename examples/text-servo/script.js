const statusEl = document.querySelector("#status");
const connectEl = document.querySelector("#connect");
const meterEl = document.querySelector("#meter");
const angleEl = document.querySelector("#angle");
const textFormEl = document.querySelector("#text-form");
const textEl = document.querySelector("#text");
const historyEl = document.querySelector("#history");

// サーボモーターの設定。minとmaxは「サーボモーターを動かす」で確かめた可動範囲にする
const SERVO = {
  channel: 0,
  min: 0,
  max: 180,
  home: 90,
  hint: "値を大きくすると左、小さくすると右を向く。90度が正面",
};

let angle = SERVO.home;
let lastInstruction = "なし";

// ---- 画面の表示 ----

meterEl.min = SERVO.min;
meterEl.max = SERVO.max;

function renderAngle() {
  meterEl.value = angle;
  angleEl.value = `${angle}度`;
}

renderAngle();

// ---- Web Serial ----

const encoder = new TextEncoder();
let port;
let writer;

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
    return;
  }
  if (message?.type === "error") {
    statusEl.textContent = `Core2がエラーを返しました: ${message.message}`;
  }
}

async function sendLine(line) {
  // 未接続のときは送信せず、画面上の角度だけを更新する
  if (writer) await writer.write(encoder.encode(`${line}\n`));
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
  connectEl.disabled = true;
  statusEl.textContent = "接続しました。";
  await sendLine("sensor off");
  await sendLine(`servo ${SERVO.channel} ${angle}`);

  await readLines(handleLine);

  writer.releaseLock();
  writer = undefined;
  await port.close().catch(() => {});
  connectEl.disabled = false;
  statusEl.textContent = "切断されました。";
});

// ---- Prompt API ----

const systemPrompt = [
  "あなたはサーボモーターの操作係です。利用者の日本語の指示を、角度の変え方の列に変換します。",
  `サーボモーターの角度は${SERVO.min}〜${SERVO.max}度です。${SERVO.hint}。`,
  'changeが"set"なら角度をvalueにし、"add"なら現在の角度にvalueを足します。',
  "「少し」は15度、程度の指定がなければ30度動かします。",
  "サーボモーターの操作と関係のない指示には、actionsを空にしてreplyで断ります。",
  "replyには利用者への短い返事を書きます。",
].join("\n");

const schema = {
  type: "object",
  properties: {
    actions: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          change: { type: "string", enum: ["set", "add"] },
          value: { type: "integer", minimum: -180, maximum: 180 },
        },
        required: ["change", "value"],
      },
    },
    reply: { type: "string" },
  },
  required: ["actions", "reply"],
};

function formatRequest(current, previous, instruction) {
  return `現在の角度: ${current}\n直前の指示: ${previous}\n指示: ${instruction}`;
}

// 入力と出力の例。SERVOの範囲やhintの向きを変えたら、例も合わせて直す
const examples = [
  [
    formatRequest(90, "なし", "左を向いて"),
    { actions: [{ change: "add", value: 30 }], reply: "左に向けます" },
  ],
  [
    formatRequest(120, "左を向いて", "もうちょっと"),
    { actions: [{ change: "add", value: 15 }], reply: "もう少し左に向けます" },
  ],
  [
    formatRequest(135, "もうちょっと", "正面に戻して"),
    { actions: [{ change: "set", value: 90 }], reply: "正面に戻します" },
  ],
  [
    formatRequest(90, "なし", "右を向いてから正面に戻して"),
    {
      actions: [
        { change: "add", value: -30 },
        { change: "set", value: 90 },
      ],
      reply: "右に向けてから正面に戻します",
    },
  ],
  [
    formatRequest(90, "なし", "今日の天気は？"),
    { actions: [], reply: "サーボモーターの動かし方を指示してください" },
  ],
];

let baseSessionPromise;

function getBaseSession() {
  baseSessionPromise ??= LanguageModel.create({
    initialPrompts: [
      { role: "system", content: systemPrompt },
      ...examples.flatMap(([request, response]) => [
        { role: "user", content: request },
        { role: "assistant", content: JSON.stringify(response) },
      ]),
    ],
  }).catch((error) => {
    baseSessionPromise = undefined;
    throw error;
  });
  return baseSessionPromise;
}

// ---- 指示から動作まで ----

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// モデルの出力は信頼できない入力として扱い、値と可動範囲をコード側で検証する
function toAngle(action) {
  if (!Number.isInteger(action.value)) return null;
  const target = action.change === "add" ? angle + action.value : action.value;
  return Math.min(SERVO.max, Math.max(SERVO.min, target));
}

async function run(instruction) {
  const row = historyEl.insertRow(0);
  row.insertCell().textContent = instruction;
  const outputCell = row.insertCell();
  const commandCell = row.insertCell();
  statusEl.textContent = "モデルが考えています…";

  try {
    const base = await getBaseSession();
    const session = await base.clone();
    const response = await session.prompt(
      formatRequest(angle, lastInstruction, instruction),
      { responseConstraint: schema },
    );
    session.destroy();
    outputCell.textContent = response;

    const { actions, reply } = JSON.parse(response);
    for (const action of actions) {
      const next = toAngle(action);
      if (next === null) continue;
      const line = `servo ${SERVO.channel} ${next}`;
      angle = next;
      renderAngle();
      await sendLine(line);
      commandCell.textContent += `${line}\n`;
      // 複数の動作は、前の動作を待ってから順に行う
      await sleep(400);
    }
    lastInstruction = instruction;
    statusEl.textContent = reply;
  } catch (error) {
    statusEl.textContent = `エラーが発生しました: ${error.message}`;
  }
}

// 指示が続けて届いても、1つずつ順番に処理する
let queue = Promise.resolve();

function handleInstruction(instruction) {
  queue = queue.then(() => run(instruction));
}

textFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const instruction = textEl.value.trim();
  if (!instruction) return;
  textEl.value = "";
  handleInstruction(instruction);
});

// ---- 対応状況の確認 ----

if (!("LanguageModel" in self)) {
  statusEl.textContent =
    "この環境ではPrompt APIを利用できません。Chrome 148以降でお試しください。";
  textFormEl.hidden = true;
} else if ((await LanguageModel.availability()) === "unavailable") {
  statusEl.textContent = "この端末ではPrompt APIを利用できません。";
  textFormEl.hidden = true;
} else {
  if ((await LanguageModel.availability()) === "available") getBaseSession();
  statusEl.textContent = "準備完了です。指示を入力してください。";
}
connectEl.hidden = !("serial" in navigator);
