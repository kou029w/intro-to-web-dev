// hello.test.js
import assert from "node:assert/strict";
import test from "node:test";

test("1と2の合計は3です", () => {
  assert.equal(1 + 2, 3);
});
