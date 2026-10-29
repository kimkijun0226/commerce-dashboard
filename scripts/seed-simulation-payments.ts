import { config } from "dotenv";
import {
  managementDbExec,
  getProjectRefFromSupabaseUrl,
} from "./managementDbQuery";
config({ path: ".env.local", quiet: true });
const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = getProjectRefFromSupabaseUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
);
if (!token || !ref)
  throw new Error("Supabase management configuration required");
managementDbExec(
  token,
  ref,
  `insert into sales_simulation_payments(sale_id,paid_at,amount,payment_method)
select id,ordered_at,gross_amount-discount_amount,payment_method from sales_simulations where status='paid'
on conflict(sale_id) do update set paid_at=excluded.paid_at,amount=excluded.amount,payment_method=excluded.payment_method;
select count(*) as payments,sum(amount) as amount,(select count(*) from orders) as actual_orders from sales_simulation_payments;`,
)
  .then((result) => console.log(JSON.stringify(result)))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
