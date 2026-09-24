const statusEl = document.querySelector("#status");
const connectEl = document.querySelector("#connect");
const homeEl = document.querySelector("#home");
const releaseEl = document.querySelector("#release");
const jointsEl = document.querySelector("#joints");
const logEl = document.querySelector("#log");

// 関節ごとの設定。可動範囲を確かめたら、minとmaxを書き換える
const JOINTS = [
  { channel: 0, label: "関節1（旋回）", min: 0, max: 180, home: 90 },
  { channel: 1, label: "関節2（グリッパー）", min: 0, max: 180, home: 90 },
];

const encoder = new TextEncoder();
let port;
let writer;

if (!("serial" in navigator)) {
  statusEl.textContent =
    "この環境ではWeb Serial APIを利用できません。Chrome 89以降でお試しください。";
  connectEl.hidden = true;
} else {
  statusEl.textContent = "M5StackをUSBで接続し、「接続」を押してください。";
}

function log(text) {
  const lines = `${logEl.textContent}${text}\n`.split("\n");
  logEl.textContent = lines.slice(-50).join("\n");
}

function sendLine(line) {
  log(`> ${line}`);
  return writer.write(encoder.encode(`${line}\n`));
}

// スライダーを動かしている間は、50ミリ秒ごとにまとめて送る
const pending = new Map();
let timer;

function queueServo(channel, angle) {
  pending.set(channel, angle);
  timer ??= setTimeout(() => {
    sendLine(`servo ${[...pending].flat().join(" ")}`);
    pending.clear();
    timer = undefined;
  }, 50);
}

const sliders = JOINTS.map((joint) => {
  const container = document.createElement("div");
  container.className = "joint";

  const label = document.createElement("label");
  label.htmlFor = `joint-${joint.channel}`;
  label.textContent = `${joint.label}（ch${joint.channel}）: `;
  const output = document.createElement("output");
  output.value = joint.home;
  label.append(output, "度");

  const slider = document.createElement("input");
  slider.id = `joint-${joint.channel}`;
  slider.type = "range";
  slider.min = joint.min;
  slider.max = joint.max;
  slider.value = joint.home;
  slider.disabled = true;
  slider.addEventListener("input", () => {
    output.value = slider.value;
    queueServo(joint.channel, slider.valueAsNumber);
  });

  container.append(label, slider);
  jointsEl.append(container);
  return { joint, slider, output };
});

function setConnected(connected) {
  connectEl.disabled = connected;
  homeEl.disabled = !connected;
  releaseEl.disabled = !connected;
  for (const { slider } of sliders) slider.disabled = !connected;
}

function moveHome() {
  for (const { joint, slider, output } of sliders) {
    slider.value = joint.home;
    output.value = joint.home;
    queueServo(joint.channel, joint.home);
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
    return;
  }
  // センサー値は使わないので、それ以外の応答だけを表示する
  if (message?.type === "sensor") return;
  log(line);
  // 起動時のreadyか、接続時に送ったpingへの応答でPCA9685の有無がわかる
  const checked = message?.type === "ready" || message?.command === "ping";
  if (checked && !message.servo) {
    statusEl.textContent =
      "PCA9685が見つかりません。配線とI2Cアドレスを確認してください。";
  }
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
  setConnected(true);
  statusEl.textContent = "接続しました。スライダーを少しずつ動かしてください。";
  // この画面ではセンサー値を使わないので、送信を止めてもらう
  sendLine("sensor off");
  sendLine("ping");
  moveHome();

  await readLines(handleLine);

  writer.releaseLock();
  await port.close().catch(() => {});
  setConnected(false);
  statusEl.textContent = "切断されました。";
});

homeEl.addEventListener("click", moveHome);
releaseEl.addEventListener("click", () => sendLine("release"));
