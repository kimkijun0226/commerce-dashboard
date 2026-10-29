import assert from "node:assert/strict";
import test from "node:test";
import { parseProductOptions, validateSelectedOptions, getCartItemKey, formatSelectedOptions } from "./productOptions";

test("parses option definitions, deduplicates values and defaults to required", () => {
  assert.deepEqual(parseProductOptions(null), []);
  assert.deepEqual(parseProductOptions([{ name: " Size ", values: ["S", "S", " L ", 2] }]), [{ name: "Size", values: ["S", "L"], required: true }]);
});

test("rejects missing required, unknown groups and tampered values", () => {
  const options = parseProductOptions([{ name: "Size", values: ["S", "L"] }, { name: "Gift", values: ["Yes"], required: false }]);
  assert.throws(() => validateSelectedOptions(options, {}), /Size/);
  assert.throws(() => validateSelectedOptions(options, { Size: "XL" }), /Size/);
  assert.throws(() => validateSelectedOptions(options, { Size: "S", Fake: "free" }), /Fake/);
  assert.throws(() => validateSelectedOptions(options, []));
  assert.deepEqual(validateSelectedOptions(options, { Size: "S" }), { Size: "S" });
  assert.deepEqual(validateSelectedOptions([], undefined), {});
});

test("canonical cart keys merge equal selections and separate variants", () => {
  assert.equal(getCartItemKey({ id: "p" }), "p");
  assert.equal(getCartItemKey({ id: "p", selectedOptions: {} }), "p");
  const a = getCartItemKey({ id: "p", selectedOptions: { Size: "S", Color: "Red" } });
  assert.equal(a, getCartItemKey({ id: "p", selectedOptions: { Color: "Red", Size: "S" } }));
  assert.notEqual(a, getCartItemKey({ id: "p", selectedOptions: { Size: "L", Color: "Red" } }));
  assert.equal(formatSelectedOptions({ Size: "S" }), "Size: S");
});

test("seller option editor validates and preserves optional groups", async () => {
  const { parseOptionEditor } = await import("./productOptions");
  assert.deepEqual(parseOptionEditor("사이즈: S, M, M\n포장?: 선물포장"), [
    { name: "사이즈", values: ["S", "M"], required: true },
    { name: "포장", values: ["선물포장"], required: false },
  ]);
  assert.deepEqual(parseOptionEditor(""), []);
  assert.throws(() => parseOptionEditor("사이즈"));
  assert.throws(() => parseOptionEditor("사이즈: S\n사이즈: M"));
});
