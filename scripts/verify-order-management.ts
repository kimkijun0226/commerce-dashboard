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
  console.log(
    await query(`begin;
 do $$ declare sid text; unpaid text; previous_time timestamptz; current_time_value timestamptz; pending_before integer; list_before jsonb; detail jsonb; begin
 perform set_config('request.jwt.claims',json_build_object('sub',(select id from users where role='admin' limit 1),'role','authenticated')::text,true);
 select id,updated_at into sid,previous_time from sales_simulations where status='paid' and fulfillment='preparing' limit 1;
 if sid is null then raise exception 'No preparation fixture'; end if;
 pending_before:=(get_admin_combined_dashboard()->>'pendingShipment')::int;
 list_before:=get_admin_orders(1,'','preparing','paid');
 if (list_before->>'total')::int<>pending_before then raise exception 'Dashboard and preparation list disagree'; end if;
 if (get_admin_orders(1,sid)->>'total')::int<>1 then raise exception 'Order search mismatch'; end if;
 if not save_portfolio_fulfillment(sid,previous_time,'shipped','직접배송','PORTFOLIO-TEST') then raise exception 'Shipping save failed'; end if;
 detail:=get_admin_portfolio_order(sid);
 if detail->>'fulfillment'<>'shipped' or detail->>'tracking_number'<>'PORTFOLIO-TEST' then raise exception 'Tracking persistence failed'; end if;
 if (get_admin_combined_dashboard()->>'pendingShipment')::int<>pending_before-1 then raise exception 'Dashboard not updated after shipping'; end if;
 if (get_admin_orders(1,'','preparing','paid')->>'total')::int<>pending_before-1 then raise exception 'Preparation list not updated'; end if;
 if save_portfolio_fulfillment(sid,previous_time,'shipped','직접배송','STALE') then raise exception 'Stale update accepted'; end if;
 current_time_value:=(detail->>'updated_at')::timestamptz;
 if not save_portfolio_fulfillment(sid,current_time_value,'delivered','직접배송','PORTFOLIO-TEST') then raise exception 'Delivery save failed'; end if;
 detail:=get_admin_portfolio_order(sid);
 begin
 perform save_portfolio_fulfillment(sid,(detail->>'updated_at')::timestamptz,'preparing','','');
 raise exception 'Expected delivered reversal rejection';
 exception when others then if sqlerrm<>'Delivered order cannot be reversed' then raise; end if; end;
 select id into unpaid from sales_simulations where status='pending' limit 1;
 detail:=get_admin_portfolio_order(unpaid);
 begin
 perform save_portfolio_fulfillment(unpaid,(detail->>'updated_at')::timestamptz,'shipped','직접배송','TEST');
 raise exception 'Expected unpaid rejection';
 exception when others then if sqlerrm<>'Paid order required' then raise; end if; end;
 end $$;
 select 'PASS: preparation totals, search, shipped/delivered save, tracking, stale update, delivered reversal and unpaid guard' as result;
 rollback;`),
  );
  await assert.rejects(
    query(`begin; set local role anon; select get_admin_orders(); rollback;`),
    /permission denied/,
  );
  const member = `select set_config('request.jwt.claims',json_build_object('sub',(select id from users where role<>'admin' limit 1),'role','authenticated')::text,true); set local role authenticated;`;
  for (const call of [
    "get_admin_orders()",
    "get_admin_portfolio_order('SIM-test')",
    "save_portfolio_fulfillment('SIM-test',now(),'shipped','test','test')",
  ]) {
    await assert.rejects(
      query(`begin;${member}select ${call};rollback;`),
      /Administrator required/,
    );
  }
  const rows = (await query(
    `begin;${member}select count(*) as visible from admin_manage_orders;rollback;`,
  )) as { visible: number }[];
  assert.equal(rows[0].visible, 0);
  console.log(
    "PASS: non-admin order read/write denied; all shipping changes rolled back",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
