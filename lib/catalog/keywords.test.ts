import assert from "node:assert/strict";
import test from "node:test";
import { parseSearchKeywords } from "./keywords";
test("seller tags accept hashes and phrases, deduplicate and enforce limits", () => {
  assert.deepEqual(parseSearchKeywords("#롱 스커트 #맥시, 치마\n롱 스커트"), [
    "롱 스커트",
    "맥시",
    "치마",
  ]);
  assert.throws(() =>
    parseSearchKeywords(
      Array.from({ length: 51 }, (_, i) => `tag${i}`).join(","),
    ),
  );
  assert.throws(() => parseSearchKeywords("a".repeat(101)));
});
