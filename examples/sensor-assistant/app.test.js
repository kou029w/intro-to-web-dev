import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import * as core from "./core.js";

// ブラウザAPIを置き換え、入力から送信までを通して確認します。
const source = (await readFile(new URL("./script.js", import.meta.url), "utf8"))
  .replace(/^import .*\n/, "");

async function setup() {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, {
      value: id === "angle" ? "120" : id === "home" ? "90" : "",
      checked: false,
      listeners: {},
      addEventListener(name, fn) { this.listeners[name] = fn; },
    });
    return elements.get(id);
  };
  let now = 2900;
  const sent = [];
  const replies = [];
  let destroyed = 0;
  const context = vm.createContext({
    ...core, document: { getElementById: element }, self: {}, navigator: {},
    performance: { now: () => now }, TextEncoder, Date,
    setInterval: () => {},
    LanguageModel: {
      create: async () => ({ clone: async () => ({
        prompt: async () => JSON.stringify(await replies.shift()),
        destroy() { destroyed++; },
      }) }),
    },
  });
  vm.runInContext(source, context);
  await vm.runInContext("LanguageModel.create().then(value => { base = value; })", context);
  context.fakeWriter = { write: async (bytes) => sent.push(new TextDecoder().decode(bytes)) };
  vm.runInContext("writer = fakeWriter; interval = 100;", context);
  for (let i = 0; i < 30; i++) {
    now = i * 100;
    context.sensorLine = JSON.stringify({ type: "sensor", accel: [0, 0, i % 2 ? 1.2 : 0.8], battery: 87 });
    vm.runInContext("handleLine(sensorLine)", context);
  }
  return { context, element, sent, replies, destroyed: () => destroyed };
}

test("音声と同じ文字入力を解釈してsensorコマンドを送り、応答で間隔を更新する", async () => {
  const app = await setup();
  app.replies.push({ kind: "set_interval", intervalMs: 500, reply: "変更します" });
  await vm.runInContext('request("0.5秒ごとに測って")', app.context);
  assert.deepEqual(app.sent, ["sensor 500\n"]);
  assert.equal(vm.runInContext("interval", app.context), 100);
  vm.runInContext('handleLine(\'{"type":"ok","command":"sensor","interval":500}\')', app.context);
  assert.equal(vm.runInContext("interval", app.context), 500);
  assert.equal(app.destroyed(), 1);
});

test("問い合わせと範囲外の変更はコマンドを送らない", async () => {
  const app = await setup();
  app.replies.push({ kind: "query", intervalMs: 0, reply: "87%です" });
  await vm.runInContext('request("バッテリーは？")', app.context);
  assert.equal(app.element("status").textContent, "87%です");
  app.replies.push({ kind: "set_interval", intervalMs: 10, reply: "変更します" });
  await assert.rejects(vm.runInContext('request("10ミリ秒にして")', app.context), /100〜1000/);
  assert.deepEqual(app.sent, []);
  assert.equal(app.destroyed(), 2);
});

test("揺れから警告角度を送り、警告済みなら繰り返さない", async () => {
  const app = await setup();
  app.element("armed").checked = true;
  app.replies.push({ comment: "固定を確認してください", level: "alert" });
  await vm.runInContext("judge()", app.context);
  await vm.runInContext("judge()", app.context);
  assert.deepEqual(app.sent, ["servo 0 120\n"]);
});

test("推論中に解除して再有効化した場合も、以前の判断で警告しない", async () => {
  const app = await setup();
  app.element("armed").checked = true;
  let finish;
  app.replies.push(new Promise((resolve) => { finish = resolve; }));
  const judging = vm.runInContext("judge()", app.context);
  await new Promise((resolve) => setImmediate(resolve));
  await app.element("reset").listeners.click();
  app.element("armed").checked = true;
  app.element("armed").listeners.change();
  finish({ comment: "警告", level: "alert" });
  await judging;
  assert.deepEqual(app.sent, ["servo 0 90\n"]);
});

test("OPFSの保存と読み込みは記録だけを扱い、保存済みコマンドを実行しない", async () => {
  const app = await setup();
  let stored = "";
  let closed = false;
  app.context.navigator.storage = {
    getDirectory: async () => ({
      getFileHandle: async (name) => {
        assert.equal(name, "sensor-log.json");
        return {
          createWritable: async () => ({
            write: async (data) => { stored = data; },
            close: async () => { closed = true; },
          }),
          getFile: async () => ({ text: async () => stored }),
        };
      },
    }),
  };
  vm.runInContext('record("sent", "servo 0 120")', app.context);
  await app.element("opfs-save").listeners.click();
  assert.equal(closed, true);
  assert.equal(JSON.parse(stored)[0].data, "servo 0 120");
  await app.element("opfs-read").listeners.click();
  assert.equal(app.element("stored").textContent, stored);
  assert.deepEqual(app.sent, []);
});

test("推論が失敗してもセッションを破棄し、次の問い合わせを受け付ける", async () => {
  const app = await setup();
  const failure = Promise.reject(new Error("推論失敗"));
  failure.catch(() => {});
  app.replies.push(failure);
  await assert.rejects(vm.runInContext('request("揺れは？")', app.context), /推論失敗/);
  app.replies.push({ kind: "query", intervalMs: 0, reply: "揺れがあります" });
  await vm.runInContext('request("揺れは？")', app.context);
  assert.equal(app.destroyed(), 2);
  assert.equal(app.element("status").textContent, "揺れがあります");
});
