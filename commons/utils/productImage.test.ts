import assert from "node:assert/strict";
import test from "node:test";
import { canPrefetchImages, warmProductImage, CATALOG_IMAGE_SIZES, DETAIL_IMAGE_SIZES } from "./productImage";

test("intent warming respects constrained networks and reuses responsive image requests", () => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const requests: { sizes?: string; srcset?: string; src?: string; fetchPriority?: string; onerror?: () => void }[] = [];
  const connection = { saveData: true, effectiveType: "4g" };
  class ImageMock { constructor() { requests.push(this); } }
  Object.defineProperty(globalThis, "window", { configurable: true, value: { Image: ImageMock, location: { href: "http://localhost:3100/" } } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { connection } });
  try {
    assert.equal(canPrefetchImages(), false);
    warmProductImage("/shirt.jpg");
    assert.equal(requests.length, 0);
    connection.saveData = false;
    connection.effectiveType = "2g";
    assert.equal(canPrefetchImages(), false);
    connection.effectiveType = "4g";
    warmProductImage("/shirt.jpg");
    warmProductImage("/shirt.jpg");
    assert.equal(requests.length, 1);
    assert.equal(requests[0].sizes, CATALOG_IMAGE_SIZES);
    assert.ok(requests[0].srcset?.includes("/_next/image?"));
    assert.equal(requests[0].fetchPriority, "low");
    warmProductImage("/shirt.jpg", true);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].sizes, DETAIL_IMAGE_SIZES);
    requests[0].onerror?.();
    warmProductImage("/shirt.jpg");
    assert.equal(requests.length, 3, "failed image requests can be retried");
  } finally {
    if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor); else Reflect.deleteProperty(globalThis, "window");
    if (navigatorDescriptor) Object.defineProperty(globalThis, "navigator", navigatorDescriptor); else Reflect.deleteProperty(globalThis, "navigator");
  }
});
