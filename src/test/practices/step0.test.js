// isLeapYear.test.js
import assert from "node:assert/strict";
import test from "node:test";
import isLeapYear from "./isLeapYear.js";

test("西暦年号が4で割り切れる年はうるう年", () => {
  assert.ok(isLeapYear(2024));
});
