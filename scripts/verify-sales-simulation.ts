import assert from "node:assert/strict";
import { config } from "dotenv";
import {
  managementDbExec,
  getProjectRefFromSupabaseUrl,
} from "./managementDbQuery";
import type { SalesData } from "../lib/admin/sales";
config({ path: ".env.local", quiet: true });
const token = process.env.SUPABASE_ACCESS_TOKEN!;
const ref = getProjectRefFromSupabaseUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
)!;
const query = (sql: string) => managementDbExec(token, ref, sql);
async function main() {
  // Claims and roles are transaction-local; no account or permission is modified.
  const claim = `select set_config('request.jwt.claims',json_build_object('sub',(select id from public.users where role='admin' limit 1),'role','authenticated')::text,true); set local role authenticated;`;
  const result = (await query(
    `begin; ${claim} select public.get_sales_simulation(30,'',1,'') as stats; rollback;`,
  )) as { stats?: SalesData }[];
  const data = result.find((r) => r.stats)?.stats;
  assert.ok(data, "Admin aggregate is readable");
  assert.equal(data.daily.length, 30);
  const sum = (rows: { revenue: number }[]) =>
    rows.reduce((a, r) => a + r.revenue, 0);
  assert.equal(sum(data.daily), data.summary.revenue);
  for (const rows of [
    data.departments,
    data.channels,
    data.regions,
    data.payments,
    data.statuses,
    data.hours,
  ]) {
    assert.equal(sum(rows), data.summary.revenue);
    assert.equal(
      rows.reduce((a, r) => a + r.orders, 0),
      data.summary.orders,
    );
  }
  assert.equal(data.total, data.summary.orders);
  assert.equal(data.rows.length, 25);
  for (const row of data.rows)
    assert.equal(
      row.net,
      row.status === "paid" ? row.gross_amount - row.discount_amount : 0,
    );
  const date = data.daily[0].day;
  const filtered = (await query(
    `begin; ${claim} select get_sales_simulation(7,'beauty',1,'paid') as stats, get_sales_simulation(30,'',1,'','${date}') as dated, get_sales_simulation(90,'',1,'') as quarter; rollback;`,
  )) as { stats?: SalesData; dated?: SalesData; quarter?: SalesData }[];
  const beauty = filtered.find((r) => r.stats)?.stats;
  assert.ok(beauty);
  assert.equal(beauty.daily.length, 7);
  assert.ok(
    beauty.rows.every((r) => r.department === "beauty" && r.status === "paid"),
  );
  const dated = filtered.find((r) => r.dated)?.dated;
  assert.ok(dated);
  assert.equal(dated.total, data.daily[0].orders);
  assert.ok(
    dated.rows.every(
      (r) =>
        new Date(r.ordered_at).toLocaleDateString("en-CA", {
          timeZone: "Asia/Seoul",
        }) === date,
    ),
  );
  assert.equal(filtered.find((r) => r.quarter)?.quarter?.daily.length, 90);
  const second = (await query(
    `begin; ${claim} select get_sales_simulation(30,'',2,'') as stats; rollback;`,
  )) as { stats?: SalesData }[];
  assert.ok(
    !second
      .find((r) => r.stats)!
      .stats!.rows.some((r) => data.rows.some((first) => first.id === r.id)),
  );
  await assert.rejects(
    query(
      `begin; set local role anon; select get_sales_simulation(); rollback;`,
    ),
    /permission denied/,
  );
  await assert.rejects(
    query(
      `begin; select set_config('request.jwt.claims',json_build_object('sub',(select id from users where role<>'admin' limit 1),'role','authenticated')::text,true); set local role authenticated; select get_sales_simulation(); rollback;`,
    ),
    /Admin access required/,
  );
  const memberRows = (await query(
    `begin; select set_config('request.jwt.claims',json_build_object('sub',(select id from users where role<>'admin' limit 1),'role','authenticated')::text,true); set local role authenticated; select count(*) as visible from sales_simulations; rollback;`,
  )) as { visible?: number }[];
  assert.equal(memberRows.find((r) => "visible" in r)?.visible, 0);
  const integrity = (await query(
    `select count(*) filter(where ordered_at>now() or discount_amount>gross_amount or quantity not between 1 and 3) as invalid from sales_simulations`,
  )) as { invalid: number }[];
  assert.equal(integrity[0].invalid, 0);
  const paymentResults = (await query(
    `begin; ${claim} select get_admin_payment_preview() as preview, (select coalesce(sum(amount),0) from sales_simulation_payments) as expected, (select count(*) from sales_simulation_payments) as payment_count; rollback;`,
  )) as {
    preview: {
      revenue: number;
      paymentCount: number;
      dailyRevenue: { day: string; amount: number }[];
    };
    expected: string;
    payment_count: number;
  }[];
  const payment = paymentResults[0];
  assert.equal(payment.preview.revenue, Number(payment.expected));
  assert.equal(payment.preview.paymentCount, payment.payment_count);
  assert.equal(payment.preview.dailyRevenue.length, 7);
  const lastSeven = (await query(
    `select coalesce(sum(amount),0) as amount from sales_simulation_payments where paid_at >= (((now() at time zone 'Asia/Seoul')::date-6)::timestamp at time zone 'Asia/Seoul')`,
  )) as { amount: string }[];
  assert.equal(
    payment.preview.dailyRevenue.reduce((sum, row) => sum + row.amount, 0),
    Number(lastSeven[0].amount),
  );
  await assert.rejects(
    query(
      `begin; set local role anon; select get_admin_payment_preview(); rollback;`,
    ),
    /permission denied/,
  );
  await assert.rejects(
    query(
      `begin; select set_config('request.jwt.claims',json_build_object('sub',(select id from users where role<>'admin' limit 1),'role','authenticated')::text,true); set local role authenticated; select get_admin_payment_preview(); rollback;`,
    ),
    /Administrator required/,
  );
  const paymentAccess = (await query(
    `begin; select set_config('request.jwt.claims',json_build_object('sub',(select id from users where role<>'admin' limit 1),'role','authenticated')::text,true); set local role authenticated; select count(*) as visible from sales_simulation_payments; rollback;`,
  )) as { visible: number }[];
  assert.equal(paymentAccess[0].visible, 0);
  console.log(
    "PASS: payment totals, seven-day revenue and payment access controls",
  );
  console.log(
    "PASS: aggregate reconciliation, dates, department/status filters, pagination, admin-only RPC and RLS",
  );
  console.log(
    JSON.stringify({
      orders: data.summary.orders,
      revenue: data.summary.revenue,
    }),
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
