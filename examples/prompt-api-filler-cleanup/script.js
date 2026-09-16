const statusEl = document.querySelector("#status");
const transcriptEl = document.querySelector("#transcript");
const autoCleanEl = document.querySelector("#auto-clean");
const recordButtonEl = document.querySelector("#record");
const cleanButtonEl = document.querySelector("#clean");
const playbackEl = document.querySelector("#playback");
const cleanedEl = document.querySelector("#cleaned");
const removedEl = document.querySelector("#removed");

if (
  !("LanguageModel" in self) ||
  (await LanguageModel.availability()) === "unavailable"
) {
  statusEl.textContent =
    "この環境ではPrompt APIを利用できません。Chrome 148以降でお試しください。";
  recordButtonEl.disabled = true;
  cleanButtonEl.disabled = true;
} else {
  statusEl.textContent = "書き起こしを録音するか、直接編集してください。";
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

async function transcribeAudio(blob) {
  const session = await LanguageModel.create({
    expectedInputs: [{ type: "text" }, { type: "audio" }],
  });

  transcriptEl.value = "";
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
    transcriptEl.value += chunk;
  }

  session.destroy();
}

async function cleanFillers(transcript) {
  cleanedEl.textContent = "";
  removedEl.textContent = "";

  const session = await LanguageModel.create({
    initialPrompts: [
      {
        role: "system",
        content:
          "あなたは音声書き起こしの校正者です。意味や内容を変えずに、「えーと」「あの」「まあ」「なんか」「そのー」のようなフィラーや言い淀みだけを取り除いた自然な文章にしてください。前置きや説明を付けず、整形後の文章だけを出力してください。",
      },
    ],
  });

  const stream = session.promptStreaming(transcript);
  for await (const chunk of stream) {
    cleanedEl.textContent += chunk;
  }

  const schema = {
    type: "object",
    properties: { removedFillers: { type: "array", items: { type: "string" } } },
    required: ["removedFillers"],
  };
  const result = await session.prompt(
    "直前の整形で実際に取り除いたフィラーを配列で挙げてください。なければ空配列にしてください。",
    { responseConstraint: schema },
  );
  const { removedFillers } = JSON.parse(result);
  removedEl.textContent = removedFillers.length
    ? removedFillers.join("、")
    : "（フィラーは見つかりませんでした）";

  session.destroy();
}

recordButtonEl.addEventListener("click", async () => {
  recordButtonEl.disabled = true;
  cleanButtonEl.disabled = true;

  try {
    statusEl.textContent = "録音しています…（5秒間）";
    const blob = await recordAudio(5000);
    playbackEl.src = URL.createObjectURL(blob);
    playbackEl.hidden = false;

    statusEl.textContent = "書き起こししています…";
    await transcribeAudio(blob);

    if (autoCleanEl.checked) {
      statusEl.textContent = "フィラーを除去しています…";
      await cleanFillers(transcriptEl.value.trim());
    }

    statusEl.textContent = "完了しました。";
  } catch (error) {
    statusEl.textContent =
      error.name === "NotAllowedError"
        ? "マイクの使用が許可されませんでした。"
        : `エラーが発生しました: ${error.message}`;
  }

  recordButtonEl.disabled = false;
  cleanButtonEl.disabled = false;
});

cleanButtonEl.addEventListener("click", async () => {
  const transcript = transcriptEl.value.trim();
  if (!transcript) {
    return;
  }

  cleanButtonEl.disabled = true;

  try {
    statusEl.textContent = "フィラーを除去しています…";
    await cleanFillers(transcript);
    statusEl.textContent = "完了しました。";
  } catch (error) {
    statusEl.textContent = `エラーが発生しました: ${error.message}`;
  }

  cleanButtonEl.disabled = false;
});
