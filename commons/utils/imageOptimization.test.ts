import assert from "node:assert/strict";
import test from "node:test";
import { shouldBypassImageOptimization } from "./imageOptimization";

test("configured product images use Next.js resizing", () => {
  for (const src of ["/images/shirt.webp", "https://images.unsplash.com/photo-shirt?w=1800", "https://shopping-phinf.pstatic.net/main_5520909/55209097628.jpg"]) {
    assert.equal(shouldBypassImageOptimization(src), false, src);
  }
});

test("custom shop hosts and unconfigured paths retain direct loading", () => {
  for (const src of ["https://shop.example.com/shirt.jpg", "http://images.unsplash.com/photo-shirt", "https://images.unsplash.com.example.com/shirt.jpg", "https://cdn.dummyjson.com/public/qr-code.png", "https://["]) {
    assert.equal(shouldBypassImageOptimization(src), true, src);
  }
});
