const statusEl = document.querySelector("#status");
const langEl = document.querySelector("#lang");
const interimEl = document.querySelector("#interim");
const continuousEl = document.querySelector("#continuous");
const localEl = document.querySelector("#local");
const startEl = document.querySelector("#start");
const stopEl = document.querySelector("#stop");
const resultsEl = document.querySelector("#results");
const interimResultEl = document.querySelector("#interim-result");

// Chrome 139より前やSafariでは、接頭辞付きの名前で提供されている
const SpeechRecognition =
  self.SpeechRecognition ?? self.webkitSpeechRecognition;

if (!SpeechRecognition) {
  statusEl.textContent = "この環境ではSpeech Recognition APIを利用できません。";
  startEl.hidden = true;
} else {
  statusEl.textContent =
    "「認識を開始」を押して、マイクに向かって話してください。";
  // 端末内での認識に対応していない環境では、選べないようにする
  localEl.disabled = !("available" in SpeechRecognition);
}

let recognition;

// 端末内で認識するための言語パックを確認し、必要ならインストールする
async function prepareLocal(lang) {
  const options = { langs: [lang], processLocally: true };
  const availability = await SpeechRecognition.available(options);
  if (availability === "available") return true;
  if (availability === "unavailable") {
    statusEl.textContent = `${lang}は端末内での認識に対応していません。`;
    return false;
  }
  statusEl.textContent = "言語パックをダウンロードしています…";
  const installed = await SpeechRecognition.install(options);
  if (!installed) statusEl.textContent = "言語パックを用意できませんでした。";
  return installed;
}

function showResults(event) {
  let interim = "";
  // resultIndexより前の結果は、以前のイベントで受け取り済み
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    const { transcript, confidence } = result[0];
    if (result.isFinal) {
      const item = document.createElement("li");
      const score = document.createElement("span");
      score.className = "confidence";
      score.textContent = `信頼度 ${confidence.toFixed(2)}`;
      item.append(transcript, score);
      resultsEl.append(item);
    } else {
      interim += transcript;
    }
  }
  interimResultEl.textContent = interim;
}

startEl.addEventListener("click", async () => {
  startEl.disabled = true;

  if (localEl.checked && !(await prepareLocal(langEl.value))) {
    startEl.disabled = false;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = langEl.value;
  recognition.interimResults = interimEl.checked;
  recognition.continuous = continuousEl.checked;
  if (localEl.checked) recognition.processLocally = true;

  recognition.addEventListener("start", () => {
    statusEl.textContent = "聞き取っています…";
    stopEl.disabled = false;
  });
  recognition.addEventListener("result", showResults);
  recognition.addEventListener("error", (event) => {
    statusEl.textContent = `エラー: ${event.error}`;
  });
  recognition.addEventListener("end", () => {
    if (!statusEl.textContent.startsWith("エラー")) {
      statusEl.textContent = "認識を終了しました。";
    }
    interimResultEl.textContent = "";
    startEl.disabled = false;
    stopEl.disabled = true;
  });

  recognition.start();
});

stopEl.addEventListener("click", () => {
  // stop()はそれまでの音声の認識結果を返してから終了する
  recognition.stop();
});
