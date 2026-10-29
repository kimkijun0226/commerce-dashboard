import assert from "node:assert/strict";
import test from "node:test";
import { catalogFilterUrl, getCampaignTarget } from "./campaigns";
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
  assert.ok(getCampaignTarget("home", 3).href.startsWith("/home?"));
  assert.equal(
    new URL(
      catalogFilterUrl("fashion", { q: "#롱 #스커트" }),
      "https://shop.test",
    ).searchParams.get("q"),
    "#롱 #스커트",
  );
});
