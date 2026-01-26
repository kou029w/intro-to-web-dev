import assert from "node:assert/strict";
import test from "node:test";
import sum from "./sum.js";

test("1と2の合計は3です", () => {
  assert.equal(sum(1, 2), 3);
});
