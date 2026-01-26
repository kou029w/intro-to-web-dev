// isLeapYear.test.js
import assert from "node:assert/strict";
import test from "node:test";
import isLeapYear from "./isLeapYear.js";

test("西暦年号が4で割り切れる年はうるう年", () => {
  assert.ok(isLeapYear(2024));
  assert.ok(isLeapYear(2028));
  assert.ok(isLeapYear(2032));
});

test("西暦年号が4で割り切れない年はうるう年でない", () => {
  assert.ok(!isLeapYear(2021));
  assert.ok(!isLeapYear(2022));
  assert.ok(!isLeapYear(2023));
});

/** TODO:
ただし、西暦年号が100で割り切れる年はうるう年でない
  たとえば、西暦2100年、2200年、2300年は100で割り切れるので、うるう年ではありません。
ただし、西暦年号が400で割り切れる年はうるう年
  たとえば、西暦2000年、2400年、2800年は400で割り切れるので、うるう年です。
*/
