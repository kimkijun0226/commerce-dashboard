import assert from "node:assert/strict";
import test from "node:test";
import { parseStoreKey, storeFromPath, storeProductUrl } from "./storefront";
test("store routes and product links keep fashion, beauty and home separate", () => {
  assert.equal(storeFromPath("/"), "home");
  assert.equal(storeFromPath("/fashion"), "fashion");
  assert.equal(storeFromPath("/beauty"), "beauty");
  assert.equal(storeFromPath("/beauty/products/p"), "beauty");
  assert.equal(storeFromPath("/home/products/p"), "home");
  assert.equal(storeFromPath("/homework"), "fashion");
  assert.equal(storeProductUrl("p", "beauty"), "/beauty/products/p");
  assert.equal(storeProductUrl("p", "home"), "/home/products/p");
  assert.equal(storeProductUrl("p"), "/products/p");
  assert.equal(parseStoreKey("invalid"), "fashion");
});
