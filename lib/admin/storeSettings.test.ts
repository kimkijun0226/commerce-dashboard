import assert from "node:assert/strict";
import test from "node:test";
import { readStoreBanners } from "./storeSettings";
import { defaultCampaigns } from "@/lib/catalog/campaigns";
test("banner configuration preserves category and tag destinations and validates assets", () => {
  const defaults = defaultCampaigns("fashion");
  const saved = readStoreBanners(JSON.stringify(defaults));
  assert.equal(saved.length, 10);
  assert.equal(saved[2].category, "자켓");
  assert.equal(saved[6].q, "스웻 팬츠");
  assert.equal(
    readStoreBanners(
      JSON.stringify([
        { ...defaults[0], q: "#롱 #스커트", category: "스커트" },
      ]),
    )[0].q,
    "#롱 #스커트",
  );
  assert.throws(() =>
    readStoreBanners(
      JSON.stringify([{ ...defaults[0], imageUrl: "javascript:alert(1)" }]),
    ),
  );
  assert.throws(() =>
    readStoreBanners(JSON.stringify([...defaults, defaults[0]])),
  );
});
