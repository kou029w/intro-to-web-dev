const statusEl = document.querySelector("#status");
const connectEl = document.querySelector("#connect");
const disconnectEl = document.querySelector("#disconnect");
const chartEl = document.querySelector("#chart");
const commandFormEl = document.querySelector("#command-form");
const commandEl = document.querySelector("#command");
const logEl = document.querySelector("#log");

const encoder = new TextEncoder();
let port;
let reader;
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

function setConnected(connected) {
  connectEl.disabled = connected;
  disconnectEl.disabled = !connected;
  commandFormEl.querySelector("button").disabled = !connected;
}

// 受信したバイト列を文字列に戻し、改行ごとに区切ってonLineに渡す
async function readLines(onLine) {
  reader = port.readable.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        onLine(line.trim());
      }
    }
  } catch (error) {
    statusEl.textContent = `受信を中断しました: ${error.message}`;
  } finally {
    reader.releaseLock();
  }
}

function sendLine(line) {
  log(`> ${line}`);
  return writer.write(encoder.encode(`${line}\n`));
}

const history = [];
const colors = ["#e53935", "#43a047", "#1e88e5"];

function drawChart() {
  const context = chartEl.getContext("2d");
  const { width, height } = chartEl;
  context.clearRect(0, 0, width, height);

  // 中央の線が0G、上端が+2G、下端が-2G
  context.strokeStyle = "#ccc";
  context.beginPath();
  context.moveTo(0, height / 2);
  context.lineTo(width, height / 2);
  context.stroke();

  for (let axis = 0; axis < 3; axis++) {
    context.strokeStyle = colors[axis];
    context.beginPath();
    history.forEach((accel, index) => {
      const x = (index / 150) * width;
      const y = height / 2 - (accel[axis] / 2) * (height / 2);
      context.lineTo(x, y);
    });
    context.stroke();
  }
}

function handleMessage(message) {
  switch (message?.type) {
    case "sensor": {
      const [ax, ay, az] = message.accel;
      document.querySelector("#ax").value = ax.toFixed(2);
      document.querySelector("#ay").value = ay.toFixed(2);
      document.querySelector("#az").value = az.toFixed(2);
      document.querySelector("#gyro").value = message.gyro.join(", ");
      document.querySelector("#battery").value = `${message.battery}%${
        message.charging ? "（充電中）" : ""
      }`;
      history.push(message.accel);
      if (history.length > 150) history.shift();
      drawChart();
      break;
    }
    case "button":
      document.querySelector("#button").value = `${
        message.name
      }（${new Date().toLocaleTimeString()}）`;
      log(JSON.stringify(message));
      break;
    default:
      log(JSON.stringify(message));
  }
}

function handleLine(line) {
  if (!line) return;
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    // 起動時のログなど、JSONでない行はそのまま表示する
    log(line);
    return;
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
  setConnected(true);
  statusEl.textContent = "接続しました。";
  // 別のページでセンサー値の送信を止めていても、ここで再開させる
  sendLine("sensor on");

  // 切断されるまで、ここで受信を続ける
  await readLines(handleLine);

  writer.releaseLock();
  await port.close().catch(() => {});
  setConnected(false);
  statusEl.textContent = "切断しました。";
});

disconnectEl.addEventListener("click", async () => {
  // read()がdone: trueで終わり、接続時の処理の続きでポートを閉じる
  await reader.cancel();
});

commandFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const command = commandEl.value.trim();
  if (command) await sendLine(command);
});
