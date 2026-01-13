"use strict";

// JavaScriptコードブロックをインタラクティブにする
function makeCodeInteractive() {
  const codeBlocks = document.querySelectorAll("pre > code.language-js");

  codeBlocks.forEach((codeBlock) => {
    const pre = codeBlock.parentElement;

    codeBlock.contentEditable = "true";
    codeBlock.spellcheck = false;

    // 矢印キーでのページ遷移を防ぐ
    codeBlock.addEventListener("keydown", (event) => {
      // MDBookのキーボードショートカットに伝播させない
      event.stopPropagation();
    });

    // スタイルを追加
    codeBlock.style.outline = "none";
    pre.style.position = "relative";
    pre.style.paddingBottom = "50px";

    // ボタンコンテナを作成
    const buttonContainer = document.createElement("div");
    buttonContainer.style.position = "absolute";
    buttonContainer.style.bottom = "10px";
    buttonContainer.style.right = "10px";
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "8px";

    // 実行ボタンを作成
    const runButton = document.createElement("button");
    runButton.textContent = "▶ 実行";
    runButton.style.padding = "6px 12px";
    runButton.style.backgroundColor = "#4CAF50";
    runButton.style.color = "white";
    runButton.style.border = "none";
    runButton.style.borderRadius = "4px";
    runButton.style.cursor = "pointer";
    runButton.style.fontSize = "14px";

    // コンソール出力エリアを作成
    const consoleOutput = document.createElement("div");
    consoleOutput.style.display = "none";
    consoleOutput.style.marginTop = "10px";
    consoleOutput.style.padding = "12px";
    consoleOutput.style.backgroundColor = "#1e1e1e";
    consoleOutput.style.color = "#d4d4d4";
    consoleOutput.style.borderRadius = "4px";
    consoleOutput.style.fontFamily = "monospace";
    consoleOutput.style.fontSize = "13px";
    consoleOutput.style.whiteSpace = "pre-wrap";
    consoleOutput.style.maxHeight = "300px";
    consoleOutput.style.overflowY = "auto";

    // ボタンをコンテナに追加
    buttonContainer.appendChild(runButton);

    // pre要素に追加
    pre.appendChild(buttonContainer);
    pre.parentElement.insertBefore(consoleOutput, pre.nextSibling);

    // コンソール表示/非表示切替
    let consoleVisible = false;

    // 実行ボタンのクリックイベント
    runButton.addEventListener("click", () => {
      const code = codeBlock.textContent;

      // コンソール出力をクリア
      consoleOutput.innerHTML = "";
      consoleOutput.style.display = "block";
      consoleVisible = true;

      // console.logをキャプチャする
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      const capturedLogs = [];

      console.log = (...args) => {
        capturedLogs.push({
          type: "log",
          args: args,
        });
        originalLog.apply(console, args);
      };

      console.error = (...args) => {
        capturedLogs.push({
          type: "error",
          args: args,
        });
        originalError.apply(console, args);
      };

      console.warn = (...args) => {
        capturedLogs.push({
          type: "warn",
          args: args,
        });
        originalWarn.apply(console, args);
      };

      // ESMとして実行するために動的にスクリプトを作成
      const scriptId = `interactive-code-${Date.now()}-${Math.random()}`;
      const script = document.createElement("script");
      script.type = "module";
      script.id = scriptId;

      // ラップされたコードを作成（console.logをキャプチャ＋トップレベルawait対応）
      const wrappedCode = `
        (async () => {
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;

          const capturedLogs = [];

          console.log = (...args) => {
            capturedLogs.push({ type: "log", args: args });
            originalLog.apply(console, args);
          };

          console.error = (...args) => {
            capturedLogs.push({ type: "error", args: args });
            originalError.apply(console, args);
          };

          console.warn = (...args) => {
            capturedLogs.push({ type: "warn", args: args });
            originalWarn.apply(console, args);
          };

          try {
            ${code}
          } catch (error) {
            capturedLogs.push({ type: "error", args: [error.message] });
          } finally {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
          }

          // 実行結果をカスタムイベントで返す
          window.dispatchEvent(new CustomEvent("${scriptId}-complete", {
            detail: { capturedLogs }
          }));
        })();
      `;

      script.textContent = wrappedCode;

      // 実行完了イベントを処理する関数
      const handleComplete = (event) => {
        const { capturedLogs } = event.detail;

        // console.logを元に戻す（念のため）
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;

        // スクリプト要素を削除
        document.getElementById(scriptId)?.remove();
        window.removeEventListener(`${scriptId}-complete`, handleComplete);

        // キャプチャしたログを表示
        capturedLogs.forEach((log) => {
          const logLine = document.createElement("div");
          logLine.style.marginBottom = "4px";

          const prefix = document.createElement("span");
          prefix.style.marginRight = "8px";

          switch (log.type) {
            case "error":
              prefix.textContent = "❌";
              logLine.style.color = "#f48771";
              break;
            case "warn":
              prefix.textContent = "⚠️";
              logLine.style.color = "#dcdcaa";
              break;
            default:
              prefix.textContent = "";
              logLine.style.color = "#4ec9b0";
          }

          logLine.appendChild(prefix);

          const formattedArgs = log.args
            .map((arg) => {
              if (typeof arg === "object") {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(arg);
                }
              }
              return String(arg);
            })
            .join(" ");

          logLine.appendChild(document.createTextNode(formattedArgs));
          consoleOutput.appendChild(logLine);
        });

        if (capturedLogs.length === 0) {
          consoleOutput.textContent = "出力なし";
          consoleOutput.style.color = "#858585";
        }
      };

      // イベントリスナーを登録してスクリプトを実行
      window.addEventListener(`${scriptId}-complete`, handleComplete);
      document.body.appendChild(script);
    });

    // ホバー時のスタイル
    runButton.addEventListener("mouseenter", () => {
      runButton.style.backgroundColor = "#45a049";
    });
    runButton.addEventListener("mouseleave", () => {
      runButton.style.backgroundColor = "#4CAF50";
    });
  });
}

// DOMContentLoaded後に実行
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", makeCodeInteractive);
} else {
  makeCodeInteractive();
}
