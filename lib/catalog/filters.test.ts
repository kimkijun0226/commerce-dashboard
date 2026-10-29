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
  assert.equal(buildCatalogSearchFilter("  스웻   팬츠  "), 'search_text.ilike."%스웻팬츠%",and(search_text.ilike."%스웻%",search_text.ilike."%팬츠%")');
  assert.ok(!buildCatalogSearchFilter("팬츠").includes("description"));
});

test("commas, quotes, percent, underscore and backslashes remain literal", () => {
  const filter = buildCatalogSearchFilter('셔츠,("100%_\\")');
  assert.ok(filter.startsWith('search_text.ilike."%셔츠,('));
  assert.ok(filter.includes('\\"100\\\\%\\\\_'));
  assert.ok(filter.includes('\\\\\\\\'));
  assert.ok(filter.endsWith(')%"'));
});

 test("hashtags and separated garment words match without requiring adjacent words", () => {
  assert.equal(normalizeCatalogSearch("#롱 #스커트"), "롱스커트");
  assert.equal(buildCatalogSearchFilter("#롱 #스커트"), buildCatalogSearchFilter("롱 스커트"));
  assert.ok(buildCatalogSearchFilter("롱 스커트").includes('and(search_text.ilike."%롱%",search_text.ilike."%스커트%")'));
});
