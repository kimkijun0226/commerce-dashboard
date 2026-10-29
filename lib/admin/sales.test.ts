import test from "node:test";
import assert from "node:assert/strict";
import { salesFilters } from "./sales";
test("sales filters reject malformed and unsupported query values", () => {
  assert.deepEqual(
    salesFilters({
      days: ["7", "90"],
      department: "unknown",
      page: "Infinity",
      status: "__proto__",
      view: "invalid",
    }),
    {
      days: 30,
      date: "",
      department: "",
      page: 10000,
      status: "",
      view: "overview",
    },
  );
  assert.equal(salesFilters({ page: "-2" }).page, 1);
  assert.equal(salesFilters({ page: "oops" }).page, 1);
  assert.deepEqual(
    salesFilters({
      days: "7",
      department: "beauty",
      page: "2",
      status: "paid",
      view: "orders",
    }),
    {
      days: 7,
      date: "",
      department: "beauty",
      page: 2,
      status: "paid",
      view: "orders",
    },
  );
});

test("sales dates reject impossible dates and preserve valid leap days", () => {
  assert.equal(salesFilters({ date: "2026-02-30" }).date, "");
  assert.equal(salesFilters({ date: "2024-02-29" }).date, "2024-02-29");
  assert.equal(salesFilters({ date: ["2026-10-01"] }).date, "");
});
