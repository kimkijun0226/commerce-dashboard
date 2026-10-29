import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { DailySalesChart, SalesBreakdownChart } from "./SalesCharts";
test("daily chart preserves readable amounts and keyboard-accessible day drilldown", () => {
  const html = renderToStaticMarkup(
    createElement(
      AppRouterContext.Provider,
      {
        value: {
          push() {},
          replace() {},
          back() {},
          forward() {},
          refresh() {},
          prefetch() {},
        },
      },
      createElement(DailySalesChart, {
        rows: [
          {
            day: "2026-10-01",
            revenue: 125000,
            orders: 3,
            href: "/admin?view=orders&date=2026-10-01",
          },
        ],
      }),
    ),
  );
  assert.match(html, /<canvas[^>]*role="img"/);
  assert.match(html, /125,000원/);
  assert.match(html, /3건/);
  assert.match(html, /href="\/admin\?view=orders&amp;date=2026-10-01"/);
});
test("breakdown charts explain empty data and retain exact accessible totals", () => {
  assert.match(
    renderToStaticMarkup(
      createElement(SalesBreakdownChart, {
        title: "결제 수단",
        rows: [],
        kind: "doughnut",
      }),
    ),
    /해당 기간 데이터가 없습니다/,
  );
  const html = renderToStaticMarkup(
    createElement(SalesBreakdownChart, {
      title: "주문 상태",
      rows: [{ label: "취소", orders: 2, revenue: 0 }],
      kind: "doughnut",
    }),
  );
  assert.match(html, /2건/);
  assert.match(html, /0원/);
  assert.match(html, /<canvas/);
});
