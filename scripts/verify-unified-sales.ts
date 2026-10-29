import assert from "node:assert/strict";
import { config } from "dotenv";
import {
  managementDbExec,
  getProjectRefFromSupabaseUrl,
} from "./managementDbQuery";
config({ path: ".env.local", quiet: true });
const token = process.env.SUPABASE_ACCESS_TOKEN!;
const ref = getProjectRefFromSupabaseUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
)!;
const query = (sql: string) => managementDbExec(token, ref, sql);
async function main() {
  // Every test order is rolled back. No PG request or committed customer data.
  console.log(
    await query(`begin;
 do $$ declare uid uuid; oid uuid:=gen_random_uuid(); pid uuid; pid2 uuid; fashion_before jsonb; beauty_before jsonb; baseline jsonb; seeded jsonb; live_before jsonb; current_stats jsonb; live_after jsonb; begin
 select id into uid from users where role='admin' limit 1;
 perform set_config('request.jwt.claims',json_build_object('sub',uid,'role','authenticated')::text,true);
 select id into pid from products where department='fashion' limit 1;
 select id into pid2 from products where department='beauty' limit 1;
 fashion_before:=get_admin_sales(7,'fashion'); beauty_before:=get_admin_sales(7,'beauty');
 baseline:=get_admin_sales(7); seeded:=get_sales_simulation(7); live_before:=get_admin_combined_dashboard();
 if (baseline->'summary'->>'revenue')::numeric < (seeded->'summary'->>'revenue')::numeric then raise exception 'Seeded sales were lost'; end if;
 insert into orders(id,user_id,status,payment_status,total_amount,subtotal_amount,discount_amount,shipping_fee,currency) values(oid,uid,'pending','requested',33000,30003,3,3000,'KRW');
 insert into order_items(order_id,product_id,product_name,quantity,unit_price,line_subtotal) values(oid,pid,'Reporting test A',1,10001,10001),(oid,pid2,'Reporting test B',1,20002,20002);
 current_stats:=get_admin_sales(7);
 if (current_stats->'summary'->>'orders')::int <> (baseline->'summary'->>'orders')::int+1 then raise exception 'Multi-item order counted more than once'; end if;
 if (current_stats->'summary'->>'revenue')::numeric <> (baseline->'summary'->>'revenue')::numeric then raise exception 'Pending order included in revenue'; end if;
 update orders set status='paid',payment_status='success',paid_at=now() where id=oid;
 current_stats:=get_admin_sales(7); live_after:=get_admin_combined_dashboard();
 if (current_stats->'summary'->>'revenue')::numeric <> (baseline->'summary'->>'revenue')::numeric+30000 then raise exception 'Paid merchandise revenue mismatch'; end if;
 if (current_stats->'summary'->>'paid')::int <> (baseline->'summary'->>'paid')::int+1 then raise exception 'Paid order double counted'; end if;
 if (get_admin_sales(7,'fashion')->'summary'->>'revenue')::numeric <> (fashion_before->'summary'->>'revenue')::numeric+10000 then raise exception 'Fashion allocation mismatch'; end if;
 if (get_admin_sales(7,'beauty')->'summary'->>'revenue')::numeric <> (beauty_before->'summary'->>'revenue')::numeric+20000 then raise exception 'Beauty allocation mismatch'; end if;
 if (current_stats->'summary'->>'units')::int <> (baseline->'summary'->>'units')::int+2 then raise exception 'Units mismatch'; end if;
 if (select sum(discount_amount) from admin_sales_lines where id='ORD-'||oid)<>3 then raise exception 'Discount allocation mismatch'; end if;
 if (live_after->>'revenue')::numeric <> (live_before->>'revenue')::numeric+33000 then raise exception 'Payment dashboard failed to include approved actual order'; end if;
 if (select sum((value->>'amount')::numeric) from jsonb_array_elements(live_after->'dailyRevenue')) <> (select sum((value->>'amount')::numeric)+33000 from jsonb_array_elements(live_before->'dailyRevenue')) then raise exception 'Daily payment totals mismatch'; end if;
 update orders set status='canceled' where id=oid;
 if (get_admin_combined_dashboard()->>'revenue')::numeric <> (live_before->>'revenue')::numeric then raise exception 'Canceled order retained in payment revenue'; end if;
 update orders set status='refunded',payment_status='refund_completed' where id=oid;
 current_stats:=get_admin_sales(7);
 if (current_stats->'summary'->>'revenue')::numeric <> (baseline->'summary'->>'revenue')::numeric then raise exception 'Refunded revenue retained'; end if;
 if (current_stats->'summary'->>'refund')::numeric <> (baseline->'summary'->>'refund')::numeric+30000 then raise exception 'Refund allocation mismatch'; end if;
 end $$;
 select 'PASS: pending → paid → canceled → refunded; multiple items, discounts, payment totals, daily totals' as result;
 rollback;`),
  );
  await assert.rejects(
    query(`begin; set local role anon; select get_admin_sales(); rollback;`),
    /permission denied/,
  );
  await assert.rejects(
    query(
      `begin; set local role anon; select get_admin_combined_dashboard(); rollback;`,
    ),
    /permission denied/,
  );
  const member = `select set_config('request.jwt.claims',json_build_object('sub',(select id from users where role<>'admin' limit 1),'role','authenticated')::text,true); set local role authenticated;`;
  await assert.rejects(
    query(`begin; ${member} select get_admin_sales(); rollback;`),
    /Admin access required/,
  );
  await assert.rejects(
    query(`begin; ${member} select get_admin_combined_dashboard(); rollback;`),
    /Administrator required/,
  );
  const rows = (await query(
    `begin; ${member} select count(*) as visible from admin_sales_lines; rollback;`,
  )) as { visible: number }[];
  assert.equal(rows[0].visible, 0);
  console.log(
    "PASS: non-admin reporting view and RPC access blocked; test data rolled back",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
