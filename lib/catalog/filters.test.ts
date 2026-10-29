import assert from "node:assert/strict";
import test from "node:test";
import { buildCatalogSearchFilter, normalizeCatalogSearch } from "./filters";

test("blank search does not create a filter", () => {
  assert.equal(buildCatalogSearchFilter("  \t\n"), "");
});

test("merchant sweat-pants synonyms match regardless of spacing or English case", () => {
  const searchText = ["COMFY 조거팬츠", "스웻 팬츠", "Sweat Pants"].map(normalizeCatalogSearch).join("\n");
  for (const keyword of ["스웻 팬츠", "스웻팬츠", "SWEAT pants"]) {
    assert.ok(searchText.includes(normalizeCatalogSearch(keyword)));
  }
  assert.equal(buildCatalogSearchFilter("  스웻   팬츠  "), 'search_text.ilike."%스웻팬츠%"');
  assert.ok(!buildCatalogSearchFilter("팬츠").includes("description"));
});

test("commas, quotes, percent, underscore and backslashes remain literal", () => {
  const filter = buildCatalogSearchFilter('셔츠,("100%_\\")');
  assert.ok(filter.startsWith('search_text.ilike."%셔츠,('));
  assert.ok(filter.includes('\\"100\\\\%\\\\_'));
  assert.ok(filter.includes('\\\\\\\\'));
  assert.ok(filter.endsWith(')%"'));
});
