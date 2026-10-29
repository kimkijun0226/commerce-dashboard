import assert from "node:assert/strict";
import test from "node:test";
import { getProductDisplayName, formatWon } from "./productDisplay";
test("hide supplier codes without dropping garment names or short details", () => {
  assert.equal(getProductDisplayName("스파오 코튼 반팔티 SPRWG25G01"), "스파오 코튼 반팔티");
  assert.equal(getProductDisplayName("탑텐 5부 티셔츠_MSG2TS2001"), "탑텐 5부 티셔츠");
  assert.equal(getProductDisplayName("에잇세컨즈 100% 코튼 티셔츠"), "에잇세컨즈 100% 코튼 티셔츠");
  assert.equal(formatWon(27400), "27,400원");
});
