import assert from "node:assert/strict";
import test from "node:test";
import { useCartStore } from "./cart-store";
import { getCartItemKey } from "../utils/productOptions";

test("guest cart merges identical selections while quantity and removal target one variant", async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests += 1; return new Response(null, { status: 401 }); };
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
    assert.equal(requests, 0, "guest cart changes must not wait for unauthorized API requests");
  } finally {
    globalThis.fetch = originalFetch;
    useCartStore.getState().clear();
  }
});

test("member cart updates immediately and rolls back when persistence fails", async () => {
  const { useSessionStore } = await import("./session-store");
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  const previousSession = useSessionStore.getState();
  let failRequest!: (response: Response) => void;
  globalThis.fetch = () => new Promise<Response>((resolve) => { failRequest = resolve; });
  console.error = () => {};
  useSessionStore.setState({ isAuthenticated: true });
  useCartStore.setState({ items: [], cartOwner: "member" });
  try {
    const result = useCartStore.getState().addItem({ id: "p", name: "Shirt", price: 100, salePrice: null, imageUrl: null });
    assert.equal(useCartStore.getState().items.length, 1, "feedback does not wait for the server");
    failRequest(new Response("failed", { status: 500 }));
    assert.equal(await result, false);
    assert.equal(useCartStore.getState().items.length, 0, "failed writes restore the previous cart");
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
    useSessionStore.setState(previousSession);
    useCartStore.getState().clear();
  }
});
