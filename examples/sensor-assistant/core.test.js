import assert from "node:assert/strict";
import { test } from "node:test";
import { intervalCommand, servoCommand, summarize, shouldWarn } from "./core.js";

function measurements(values, start = 0, step = 100) {
  return values.map((z, i) => ({ accel: [0, 0, z], battery: 87, receivedAt: start + i * step }));
}

test("静止と揺れを区別し、計測間隔を集計に含める", () => {
  const still = summarize(measurements(Array(30).fill(1)), 2900, 100);
  assert.equal(still.shake, "静止");
  assert.equal(still.deviationG, 0);
  const shake = summarize(measurements([0.8, 1.2, 0.8, 1.2, 0.8, 1.2], 0, 500), 2500, 500);
  assert.equal(shake.shake, "大きな揺れ");
  assert.equal(shake.durationMs, 2500);
  assert.equal(shake.intervalMs, 500);
});

test("古い計測値を除外し、受信停止や件数不足では判断しない", () => {
  const values = measurements(Array(40).fill(1));
  assert.equal(summarize(values, 3900, 100).count, 31);
  assert.throws(() => summarize(values, 5500, 100), /受信が止まって/);
  assert.throws(() => summarize(values.slice(0, 2), 100, 100), /不足/);
});

test("計測間隔の範囲外、整数以外、文字列を拒否する", () => {
  assert.equal(intervalCommand(100), "sensor 100");
  assert.equal(intervalCommand(500), "sensor 500");
  assert.equal(intervalCommand(1000), "sensor 1000");
  for (const value of [10, 1001, 100.5, "500", NaN, Infinity]) {
    assert.throws(() => intervalCommand(value));
  }
});

test("角度の範囲外と非数値を機器に送らない", () => {
  assert.equal(servoCommand(120), "servo 0 120");
  for (const value of [-1, 181, 90.5, "90", NaN]) assert.throws(() => servoCommand(value));
});

test("alertでも未有効、警告済み、時間不足、揺れ不足ならサーボモーターを動かさない", () => {
  const summary = { durationMs: 2900, deviationG: 0.18 };
  const result = { level: "alert" };
  assert.equal(shouldWarn(summary, result, true, false), true);
  assert.equal(shouldWarn(summary, result, false, false), false);
  assert.equal(shouldWarn(summary, result, true, true), false);
  assert.equal(shouldWarn(summary, { level: "warning" }, true, false), false);
  assert.equal(shouldWarn({ ...summary, durationMs: 1900 }, result, true, false), false);
  assert.equal(shouldWarn({ ...summary, deviationG: 0.0996 }, result, true, false), false);
});
