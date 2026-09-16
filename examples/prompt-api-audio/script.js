const statusEl = document.querySelector("#status");
const buttonEl = document.querySelector("#run");
const playbackEl = document.querySelector("#playback");
const outputEl = document.querySelector("#output");

if (
  !("LanguageModel" in self) ||
  (await LanguageModel.availability()) === "unavailable"
) {
  statusEl.textContent =
    "この環境ではPrompt APIを利用できません。Chrome 148以降でお試しください。";
  buttonEl.hidden = true;
} else {
  statusEl.textContent = "準備完了です。マイクの使用を許可してください。";
}

async function recordAudio(durationMs) {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  const chunks = [];
  const recorder = new MediaRecorder(mediaStream);
  recorder.addEventListener("dataavailable", (event) => {
    chunks.push(event.data);
  });

  recorder.start();
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  recorder.stop();
  await new Promise((resolve) => recorder.addEventListener("stop", resolve));

  mediaStream.getTracks().forEach((track) => track.stop());
  return new Blob(chunks, { type: recorder.mimeType });
}

buttonEl.addEventListener("click", async () => {
  buttonEl.disabled = true;
  outputEl.textContent = "";

  try {
    statusEl.textContent = "録音しています…（5秒間）";
    const blob = await recordAudio(5000);
    playbackEl.src = URL.createObjectURL(blob);
    playbackEl.hidden = false;

    statusEl.textContent = "モデルを準備しています…";
    const session = await LanguageModel.create({
      expectedInputs: [{ type: "text" }, { type: "audio" }],
    });

    statusEl.textContent = "文字起こししています…";
    const stream = session.promptStreaming([
      {
        role: "user",
        content: [
          { type: "text", value: "この音声を日本語で文字起こししてください。" },
          { type: "audio", value: await blob.arrayBuffer() },
        ],
      },
    ]);
    for await (const chunk of stream) {
      outputEl.textContent += chunk;
    }

    session.destroy();
    statusEl.textContent = "完了しました。";
  } catch (error) {
    statusEl.textContent =
      error.name === "NotAllowedError"
        ? "マイクの使用が許可されませんでした。"
        : `エラーが発生しました: ${error.message}`;
  }

  buttonEl.disabled = false;
});
