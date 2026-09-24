const summaryEl = document.querySelector("#summary");
const checksEl = document.querySelector("#checks");
const testEl = document.querySelector("#test");
const progressEl = document.querySelector("#progress");
const testStatusEl = document.querySelector("#test-status");
const resultEl = document.querySelector("#result");

const MIN_CHROMIUM_VERSION = 148;

function addCheck(name, value, verdict) {
  const row = checksEl.insertRow();
  row.insertCell().textContent = name;
  row.insertCell().textContent = value;
  row.insertCell().textContent = { ok: "✅ OK", ng: "❌ NG", info: "ℹ️ 参考" }[
    verdict
  ];
}

// ブラウザ（Chrome・Edgeなどに共通するChromiumのバージョンで判定する）
const brands = navigator.userAgentData?.brands ?? [];
const chromium = brands.find((b) => b.brand === "Chromium");
const chromiumVersion = Number(chromium?.version ?? 0);
// "Not.A/Brand"のようなダミーのブランドを除いた、ブラウザ固有の名前
const browser = brands.find(
  (b) => b !== chromium && !/not.a.brand/i.test(b.brand),
);
addCheck(
  "ブラウザ",
  !chromium
    ? "Chromium系のブラウザではありません"
    : browser
      ? `${browser.brand}（Chromium ${chromiumVersion}）`
      : `Chromium ${chromiumVersion}`,
  chromiumVersion >= MIN_CHROMIUM_VERSION ? "ok" : "ng",
);

// OS
const platform = navigator.userAgentData?.platform || navigator.platform;
addCheck("OS", platform, navigator.userAgentData?.mobile ? "ng" : "info");

// CPU・メモリ（GPUを使えない場合はRAM 16GB以上・4コア以上が必要）
addCheck(
  "CPUの論理コア数",
  `${navigator.hardwareConcurrency}`,
  navigator.hardwareConcurrency >= 4 ? "ok" : "ng",
);
addCheck(
  "メモリ（概算）",
  navigator.deviceMemory ? `約${navigator.deviceMemory}GB` : "取得できません",
  "info",
);

// GPU（WebGPUが使えればアダプター名を表示する）
const adapter = await navigator.gpu?.requestAdapter();
addCheck(
  "GPU（WebGPU）",
  adapter
    ? [adapter.info.vendor, adapter.info.architecture, adapter.info.description]
        .filter(Boolean)
        .join(" / ") || "検出されました"
    : "検出されませんでした",
  "info",
);

// Prompt API
const hasLanguageModel = "LanguageModel" in self;
addCheck(
  "LanguageModel",
  hasLanguageModel ? "あり" : "なし",
  hasLanguageModel ? "ok" : "ng",
);

const availability = hasLanguageModel
  ? await LanguageModel.availability()
  : "unavailable";
addCheck(
  "LanguageModel.availability()",
  availability,
  availability === "unavailable" ? "ng" : "ok",
);

const messages = {
  available: "準備完了です。下のボタンで応答を確認してください。",
  downloadable:
    "利用できます。受講前に下のボタンでモデルをダウンロードしておいてください。",
  downloading: "モデルをダウンロード中です。下のボタンで進捗を確認できます。",
  unavailable:
    "この環境ではPrompt APIを利用できません。チェックリストの要件を確認してください。",
};
summaryEl.textContent = messages[availability];
testEl.disabled = availability === "unavailable";

testEl.addEventListener("click", async () => {
  testEl.disabled = true;
  resultEl.textContent = "";
  testStatusEl.textContent = "セッションを作成しています…";

  try {
    const session = await LanguageModel.create({
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          progressEl.hidden = false;
          progressEl.value = e.loaded;
          testStatusEl.textContent = `ダウンロード中… ${Math.round(
            e.loaded * 100,
          )}%`;
        });
      },
    });

    testStatusEl.textContent = "応答を生成しています…";
    const stream = session.promptStreaming(
      "「準備完了」という意味の短い挨拶を日本語で一文だけ返してください。",
    );
    for await (const chunk of stream) {
      resultEl.textContent += chunk;
    }
    session.destroy();

    testStatusEl.textContent = "✅ 動作確認が完了しました。";
    summaryEl.textContent = messages.available;
  } catch (error) {
    testStatusEl.textContent = `❌ エラーが発生しました: ${error.name}: ${error.message}`;
  } finally {
    testEl.disabled = false;
  }
});
