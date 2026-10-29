import assert from "node:assert/strict";
import test from "node:test";
import { animateToCart } from "./cartAnimation";

test("flight shrinks to cart, triggers cart wobble and removes its temporary image", async () => {
  const animations: { frames: Keyframe[]; target: string }[] = [];
  let removed = false;
  const target = {
    animate: (frames: Keyframe[]) => { animations.push({ frames, target: "cart" }); return {}; },
    getAnimations: () => [],
    getBoundingClientRect: () => ({ left: 400, top: 10, width: 40, height: 40 }),
  };
  const image = {
    style: {}, dataset: {}, setAttribute: () => {},
    animate: (frames: Keyframe[]) => { animations.push({ frames, target: "image" }); return { finished: Promise.resolve() }; },
    remove: () => { removed = true; },
  };
  const doc = Object.getOwnPropertyDescriptor(globalThis, "document");
  const win = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "document", { configurable: true, value: { querySelector: () => target, createElement: () => image, body: { append: () => {} } } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: false }) } });
  try {
    await animateToCart({ src: "/shirt.jpg", rect: { left: 10, top: 200, width: 200, height: 250 } as DOMRect });
    assert.equal(animations[0].target, "image");
    assert.match(String(animations[0].frames.at(-1)?.transform), /scale\(\.07\)/);
    assert.equal(animations[1].target, "cart");
    assert.ok(animations[1].frames.some((frame) => String(frame.transform).includes("rotate(-16deg)")));
    assert.ok(removed);
    animations.length = 0;
    Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: () => ({ matches: true }) } });
    await animateToCart({ src: "/shirt.jpg", rect: {} as DOMRect });
    assert.equal(animations.length, 0, "reduced-motion skips the animation");
  } finally {
    if (doc) Object.defineProperty(globalThis, "document", doc); else Reflect.deleteProperty(globalThis, "document");
    if (win) Object.defineProperty(globalThis, "window", win); else Reflect.deleteProperty(globalThis, "window");
  }
});
