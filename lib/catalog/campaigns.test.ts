import assert from "node:assert/strict";
import test from "node:test";
import { catalogFilterUrl, getCampaignTarget, catalogFilterLocation } from "./campaigns";
test("banner destinations filter the correct storefront and survive direct navigation", () => {
  assert.equal(getCampaignTarget("fashion", 2).category, "자켓");
  assert.equal(
    new URL(
      getCampaignTarget("fashion", 2).href,
      "https://shop.test",
    ).searchParams.get("category"),
    "자켓",
  );
  assert.equal(
    new URL(
      getCampaignTarget("fashion", 6).href,
      "https://shop.test",
    ).searchParams.get("q"),
    "스웻 팬츠",
  );
  assert.ok(getCampaignTarget("beauty", 2).href.startsWith("/beauty?"));
  assert.ok(getCampaignTarget("home", 3).href.startsWith("/?"));
  assert.equal(
    new URL(
      catalogFilterUrl("fashion", { q: "#롱 #스커트" }),
      "https://shop.test",
    ).searchParams.get("q"),
    "#롱 #스커트",
  );
});

test("category filtering never changes the route used by header navigation", () => {
  for (const path of ["/", "/home", "/fashion", "/products", "/beauty"]) {
    const filtered = catalogFilterLocation(`https://shop.test${path}?q=old`, {category: "의자"});
    const result = new URL(filtered, "https://shop.test");
    assert.equal(result.pathname, path);
    assert.equal(result.searchParams.get("category"), "의자");
    assert.equal(result.searchParams.has("q"), false);
    assert.equal(catalogFilterLocation(result.href, {}), path);
  }
});
