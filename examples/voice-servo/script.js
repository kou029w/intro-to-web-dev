const statusEl = document.querySelector("#status");
const connectEl = document.querySelector("#connect");
const jointsEl = document.querySelector("#joints");
const talkEl = document.querySelector("#talk");
const heardEl = document.querySelector("#heard");
const textFormEl = document.querySelector("#text-form");
const textEl = document.querySelector("#text");
const historyEl = document.querySelector("#history");

// 関節ごとの設定。minとmaxは「サーボモーターを動かす」で確かめた可動範囲にする
const JOINTS = [
  {
    name: "base",
    channel: 0,
    label: "旋回",
    min: 0,
    max: 180,
    home: 90,
    hint: "値を大きくすると左、小さくすると右を向く。90度が正面",
  },
  {
    name: "grip",
    channel: 1,
    label: "グリッパー",
    min: 40,
    max: 120,
    home: 60,
    hint: "値を大きくすると閉じてつかみ、小さくすると開いて離す",
  },
];

const angles = Object.fromEntries(JOINTS.map((j) => [j.name, j.home]));
let lastInstruction = "なし";

// ---- 画面の表示 ----

const meters = Object.fromEntries(
  JOINTS.map((joint) => {
    const row = jointsEl.insertRow();
    row.insertCell().textContent = `${joint.label}（${joint.name}）`;
    const meter = document.createElement("meter");
    meter.min = joint.min;
    meter.max = joint.max;
    const output = document.createElement("output");
    row.insertCell().append(meter);
    row.insertCell().append(output);
    return [joint.name, { meter, output }];
  }),
);

function renderAngles() {
  for (const [name, { meter, output }] of Object.entries(meters)) {
    meter.value = angles[name];
    output.value = `${angles[name]}度`;
  }
}

renderAngles();

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
    statusEl.textContent = `M5Stackがエラーを返しました: ${message.message}`;
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
  await sendLine(
    `servo ${JOINTS.map((j) => `${j.channel} ${angles[j.name]}`).join(" ")}`,
  );

  await readLines(handleLine);

  writer.releaseLock();
  writer = undefined;
  await port.close().catch(() => {});
  connectEl.disabled = false;
  statusEl.textContent = "切断されました。";
});

// ---- Prompt API ----

const systemPrompt = [
  "あなたはロボットアームの操作係です。利用者の日本語の指示を、関節の動作の列に変換します。",
  "関節の一覧:",
  ...JOINTS.map(
    (j) => `- ${j.name}（${j.label}）: ${j.min}〜${j.max}度。${j.hint}。`,
  ),
  'changeが"set"なら角度をvalueにし、"add"なら現在の角度にvalueを足します。',
  "「少し」は15度、程度の指定がなければ30度動かします。",
  "指示と関係のない関節は動かしません。",
  "アームの操作と関係のない指示には、actionsを空にしてreplyで断ります。",
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
          joint: { type: "string", enum: JOINTS.map((j) => j.name) },
          change: { type: "string", enum: ["set", "add"] },
          value: { type: "integer", minimum: -180, maximum: 180 },
        },
        required: ["joint", "change", "value"],
      },
    },
    reply: { type: "string" },
  },
  required: ["actions", "reply"],
};

function formatRequest(current, previous, instruction) {
  const state = Object.entries(current)
    .map(([name, angle]) => `${name}=${angle}`)
    .join(", ");
  return `現在の角度: ${state}\n直前の指示: ${previous}\n指示: ${instruction}`;
}

// 入力と出力の例。JOINTSの名前や範囲を変えたら、例も合わせて直す
const examples = [
  [
    formatRequest({ base: 90, grip: 60 }, "なし", "左を向いて"),
    {
      actions: [{ joint: "base", change: "add", value: 30 }],
      reply: "左に向けます",
    },
  ],
  [
    formatRequest({ base: 120, grip: 60 }, "左を向いて", "もうちょっと"),
    {
      actions: [{ joint: "base", change: "add", value: 15 }],
      reply: "もう少し左に向けます",
    },
  ],
  [
    formatRequest({ base: 90, grip: 60 }, "なし", "つかんで"),
    {
      actions: [{ joint: "grip", change: "set", value: 120 }],
      reply: "つかみます",
    },
  ],
  [
    formatRequest({ base: 45, grip: 120 }, "つかんで", "正面に戻して離して"),
    {
      actions: [
        { joint: "base", change: "set", value: 90 },
        { joint: "grip", change: "set", value: 40 },
      ],
      reply: "正面に戻してから離します",
    },
  ],
  [
    formatRequest({ base: 90, grip: 60 }, "なし", "今日の天気は？"),
    { actions: [], reply: "アームの動かし方を指示してください" },
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

// モデルの出力は信頼できない入力として扱い、関節名と可動範囲をコード側で検証する
function toCommand(action) {
  const joint = JOINTS.find((j) => j.name === action.joint);
  if (!joint || !Number.isInteger(action.value)) return null;
  const target =
    action.change === "add" ? angles[joint.name] + action.value : action.value;
  const angle = Math.min(joint.max, Math.max(joint.min, target));
  return { joint, angle };
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
      formatRequest(angles, lastInstruction, instruction),
      { responseConstraint: schema },
    );
    session.destroy();
    outputCell.textContent = response;

    const { actions, reply } = JSON.parse(response);
    for (const action of actions) {
      const command = toCommand(action);
      if (!command) continue;
      const line = `servo ${command.joint.channel} ${command.angle}`;
      angles[command.joint.name] = command.angle;
      renderAngles();
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

// ---- Speech Recognition ----

const SpeechRecognition =
  self.SpeechRecognition ?? self.webkitSpeechRecognition;
let processLocally = false;

if (SpeechRecognition && "available" in SpeechRecognition) {
  const availability = await SpeechRecognition.available({
    langs: ["ja-JP"],
    processLocally: true,
  });
  processLocally = availability === "available";
}

talkEl.addEventListener("click", () => {
  const recognition = new SpeechRecognition();
  recognition.lang = "ja-JP";
  recognition.interimResults = true;
  recognition.processLocally = processLocally;

  recognition.addEventListener("result", (event) => {
    const result = event.results[0];
    heardEl.textContent = result[0].transcript;
    if (result.isFinal) handleInstruction(result[0].transcript);
  });
  recognition.addEventListener("error", (event) => {
    statusEl.textContent = `音声認識のエラー: ${event.error}`;
  });
  recognition.addEventListener("end", () => {
    talkEl.disabled = false;
  });

  talkEl.disabled = true;
  heardEl.textContent = "聞き取っています…";
  recognition.start();
  // 話しているあいだに、モデルの準備を進めておく
  getBaseSession().catch(() => {});
});

// ---- 対応状況の確認 ----

if (!("LanguageModel" in self)) {
  statusEl.textContent =
    "この環境ではPrompt APIを利用できません。Chrome 148以降でお試しください。";
  talkEl.hidden = true;
  textFormEl.hidden = true;
} else if ((await LanguageModel.availability()) === "unavailable") {
  statusEl.textContent = "この端末ではPrompt APIを利用できません。";
  talkEl.hidden = true;
  textFormEl.hidden = true;
} else {
  if ((await LanguageModel.availability()) === "available") getBaseSession();
  statusEl.textContent = SpeechRecognition
    ? `準備完了です。音声認識は${
        processLocally ? "端末内" : "サーバー"
      }で処理します。`
    : "音声認識を利用できないため、文字で指示してください。";
}
talkEl.hidden ||= !SpeechRecognition;
connectEl.hidden = !("serial" in navigator);
