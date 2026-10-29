import assert from "node:assert/strict";
import test from "node:test";
import { useCartStore } from "./cart-store";
import { getCartItemKey } from "../utils/productOptions";

test("guest cart merges identical selections while quantity and removal target one variant", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 401 });
  useCartStore.setState({ items: [], cartOwner: "guest" });
  const product = { id: "p", name: "Shirt", price: 100, salePrice: null, imageUrl: null };
  try {
    await useCartStore.getState().addItem({ ...product, selectedOptions: { Size: "S" } });
    await useCartStore.getState().addItem({ ...product, selectedOptions: { Size: "L" } });
    await useCartStore.getState().addItem({ ...product, selectedOptions: { Size: "S" } });
    assert.deepEqual(useCartStore.getState().items.map((item) => item.quantity), [2, 1]);
    const key = getCartItemKey(useCartStore.getState().items[0]);
    await useCartStore.getState().updateItemQuantity(key, 4);
    assert.deepEqual(useCartStore.getState().items.map((item) => item.quantity), [4, 1]);
    await useCartStore.getState().removeItem(key);
    assert.equal(useCartStore.getState().items.length, 1);
    assert.deepEqual(useCartStore.getState().items[0].selectedOptions, { Size: "L" });
  } finally {
    globalThis.fetch = originalFetch;
    useCartStore.getState().clear();
  }
});
