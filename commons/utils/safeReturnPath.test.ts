import assert from "node:assert/strict";
import test from "node:test";
import { safeReturnPath } from "./safeReturnPath";
test("login returns to the current store without permitting external redirects", () => {
  assert.equal(safeReturnPath("/beauty/products/p"), "/beauty/products/p");
  for (const value of [null, "https://example.com", "//example.com", "/\\example.com", "/\n/example.com"]) assert.equal(safeReturnPath(value), "/");
});
