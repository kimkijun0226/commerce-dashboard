import assert from "node:assert/strict";
import test from "node:test";
import { imageUrl, readProductForm, readFulfillmentForm } from "./validation";
function form(values: Record<string, string>) {
  const f = new FormData();
  Object.entries(values).forEach(([k, v]) => f.set(k, v));
  return f;
}
test("product writes reject invalid prices, image schemes and preserve seller search tags", () => {
  const valid = {
    name: "롱 플리츠 스커트",
    department: "fashion",
    status: "registered",
    price: "39000",
    salePrice: "29000",
    categories: "스커트",
    imageUrl: "https://example.com/skirt.jpg",
    keywords: "#롱 스커트 #맥시",
    options: "사이즈: S, M",
  };
  assert.deepEqual(readProductForm(form(valid)).search_keywords, [
    "롱 스커트",
    "맥시",
  ]);
  assert.throws(() => readProductForm(form({ ...valid, salePrice: "40000" })));
  assert.throws(() => readProductForm(form({ ...valid, price: "-1" })));
  assert.throws(() => imageUrl("javascript:alert(1)", true));
  assert.throws(() => imageUrl("//evil.test/image", true));
});
test("fulfillment requires paid orders and carrier/tracking; delivery cannot be reversed", () => {
  const shipped = form({
    fulfillmentStatus: "shipped",
    shippingCarrier: "CJ대한통운",
    trackingNumber: "123456",
  });
  assert.throws(() => readFulfillmentForm(shipped, false, "unfulfilled"));
  assert.equal(
    readFulfillmentForm(shipped, true, "preparing").fulfillment_status,
    "shipped",
  );
  assert.throws(() =>
    readFulfillmentForm(
      form({ fulfillmentStatus: "delivered" }),
      true,
      "shipped",
    ),
  );
  assert.throws(() => readFulfillmentForm(shipped, true, "delivered"));
});
