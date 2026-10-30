import assert from "node:assert/strict";
import test from "node:test";
import {
  parseStoreKey,
  storeFromPath,
  storeProductUrl,
  explicitStoreFromPath,
  isStorefrontMain,
} from "./storefront";
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

test("shared account routes preserve store selection and only storefront mains show navigation", () => {
  assert.equal(explicitStoreFromPath("/account"), null);
  assert.equal(explicitStoreFromPath("/account/orders"), null);
  assert.equal(explicitStoreFromPath("/cart"), null);
  assert.equal(explicitStoreFromPath("/beauty/products/p"), "beauty");
  assert.equal(isStorefrontMain("/beauty"), true);
  assert.equal(isStorefrontMain("/beauty/products/p"), false);
  assert.equal(isStorefrontMain("/account"), false);
});
