const statusEl = document.querySelector("#status");
const connectEl = document.querySelector("#connect");
const homeEl = document.querySelector("#home");
const releaseEl = document.querySelector("#release");
const servoEl = document.querySelector("#servo");
const logEl = document.querySelector("#log");

// サーボモーターの設定。可動範囲を確かめたら、minとmaxを書き換える
const SERVO = { channel: 0, min: 0, max: 180, home: 90 };

const encoder = new TextEncoder();
let port;
let writer;

if (!("serial" in navigator)) {
  statusEl.textContent =
    "この環境ではWeb Serial APIを利用できません。Chrome 89以降でお試しください。";
  connectEl.hidden = true;
} else {
  statusEl.textContent = "Core2をUSBで接続し、「接続」を押してください。";
}

function log(text) {
  const lines = `${logEl.textContent}${text}\n`.split("\n");
  logEl.textContent = lines.slice(-50).join("\n");
}

function sendLine(line) {
  log(`> ${line}`);
  return writer.write(encoder.encode(`${line}\n`));
}

// スライダーを動かしている間は、50ミリ秒ごとに最後の角度だけを送る
let pendingAngle;
let timer;

function queueServo(angle) {
  pendingAngle = angle;
  timer ??= setTimeout(() => {
    sendLine(`servo ${SERVO.channel} ${pendingAngle}`);
    timer = undefined;
  }, 50);
}

const label = document.createElement("label");
label.htmlFor = "angle";
label.textContent = `角度（ch${SERVO.channel}）: `;
const output = document.createElement("output");
output.value = SERVO.home;
label.append(output, "度");

const slider = document.createElement("input");
slider.id = "angle";
slider.type = "range";
slider.min = SERVO.min;
slider.max = SERVO.max;
slider.value = SERVO.home;
slider.disabled = true;
slider.addEventListener("input", () => {
  output.value = slider.value;
  queueServo(slider.valueAsNumber);
});

servoEl.append(label, slider);

function setConnected(connected) {
  connectEl.disabled = connected;
  homeEl.disabled = !connected;
  releaseEl.disabled = !connected;
  slider.disabled = !connected;
}

function moveHome() {
  slider.value = SERVO.home;
  output.value = SERVO.home;
  queueServo(SERVO.home);
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
