// スライド（src/web-ai/_day*.md）の一部を画像に書き出し、教材ページの挿絵にする。
// 使い方: node scripts/slide-images.mjs
// 必要なもの: Chrome（CHROME_PATH）、npx（@marp-team/marp-cli）、cwebp
//
// スライドの番号は追加や削除でずれるため、見出しの文字列で対象のスライドを選ぶ。

import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "src/web-ai/assets/slides");

/** 出力するファイル名 → [スライドのファイル, スライドの見出し] */
const targets = {
  "day1-stream.webp": ["_day1.md", "応答も受信も、同じストリーム"],
  "day1-labels.webp": ["_day1.md", "数値は、意味のあるラベルにしてから渡す"],
  "day2-cps.webp": ["_day2.md", "現実を測り、判断し、動かす"],
  "day2-browsers.webp": ["_day2.md", "同じコードが、Chrome でも Firefox でも"],
  "day2-protocol.webp": ["_day2.md", "ブリッジとの取り決め"],
  "day2-port.webp": ["_day2.md", "ポートは利用者が選ぶ"],
  "day2-fragments.webp": ["_day2.md", "届くのは「断片」であって「行」ではない"],
  "day2-newline.webp": ["_day2.md", "送るときは、改行まで"],
  "day2-servo-range.webp": ["_day2.md", "サーボの可動範囲を記録する"],
  "day2-model-code.webp": ["_day2.md", "言葉はモデルに、計算はコードに"],
  "day2-hint.webp": ["_day2.md", "`hint` と例を、自分のサーボに合わせる"],
  "day2-speech.webp": ["_day2.md", "声を認識する場所"],
  "day2-alarm.webp": ["_day2.md", "揺れへの警告"],
  "day2-interval.webp": ["_day2.md", "計測間隔を声で変える"],
};

/** スライドの見出し（`# `で始まる行）を、スライドの順に返す */
function headings(file) {
  const text = readFileSync(path.join(root, "src/web-ai", file), "utf8");
  // 先頭のフロントマターを除き、`---`だけの行でスライドを区切る
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, "");
  return body
    .split(/^---$/m)
    .map((slide) => slide.match(/^# (.+)$/m)?.[1].trim());
}

mkdirSync(outDir, { recursive: true });
const tmp = mkdtempSync(path.join(tmpdir(), "slide-images-"));
try {
  const decks = [...new Set(Object.values(targets).map(([file]) => file))];
  for (const file of decks) {
    // 挿絵にはページ番号がいらないため、ページ番号を切った複製を書き出す。
    // 画像の相対パスが変わらないよう、複製は元のスライドと同じディレクトリに置く。
    const src = path.join(root, "src/web-ai", file);
    const copy = path.join(root, "src/web-ai", `.slide-images-${file}`);
    writeFileSync(
      copy,
      readFileSync(src, "utf8").replace(/^paginate: true$/m, "paginate: false"),
    );
    try {
      execFileSync(
        "npx",
        [
          "-y",
          "@marp-team/marp-cli",
          "--theme-set",
          "src/web-ai/theme.css",
          "--html",
          "--allow-local-files",
          "--images",
          "png",
          "--image-scale",
          "1.5",
          "--output",
          path.join(tmp, `${path.basename(file, ".md")}.png`),
          copy,
        ],
        { cwd: root, stdio: "inherit" },
      );
    } finally {
      rmSync(copy, { force: true });
    }
  }

  const pngs = readdirSync(tmp);
  for (const [name, [file, heading]] of Object.entries(targets)) {
    const index = headings(file).indexOf(heading);
    if (index < 0) throw new Error(`${file}に見出し「${heading}」がありません`);
    const png = `${path.basename(file, ".md")}.${String(index + 1).padStart(3, "0")}.png`;
    if (!pngs.includes(png)) throw new Error(`${png}が書き出されていません`);
    execFileSync("cwebp", [
      "-quiet",
      "-q",
      "90",
      path.join(tmp, png),
      "-o",
      path.join(outDir, name),
    ]);
    console.log(`${name} <- ${png}（${heading}）`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
