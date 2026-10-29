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
// Deterministic IDs make re-running safe. Never writes customer orders or payments.
const sql = `
with catalog as (select id,name,department,coalesce(sale_price,price)::bigint as price,row_number() over(order by id) as rn,count(*) over() as total from products where status='registered'),
dates as(select d::date as day from generate_series((now() at time zone 'Asia/Seoul')::date-179,(now() at time zone 'Asia/Seoul')::date,interval '1 day') d),
slots as(select day,n,abs(hashtextextended(day::text||':'||n,12)%1000000) as r from dates cross join lateral generate_series(1,150+abs(hashtextextended(day::text,9)%130)::int+case when extract(isodow from day) in (6,7) then 60 else 0 end) n),
facts as(select s.*,p.*,1+(r/13%100<18)::int+(r/13%100<4)::int as qty,((day::timestamp + make_interval(secs=>((case when r/17%100<5 then r%7 when r/17%100<30 then 7+r%6 when r/17%100<55 then 13+r%5 else 18+r%6 end)*3600+r%3600)::double precision)) at time zone 'Asia/Seoul') as at from slots s join catalog p on p.rn=1+(s.r%(select max(total) from catalog)))
insert into sales_simulations(id,ordered_at,product_id,product_name,department,quantity,gross_amount,discount_amount,status,fulfillment,channel,region,payment_method,returning_customer)
select 'SIM-'||to_char(day,'YYYYMMDD')||'-'||lpad(n::text,4,'0'),at,id,name,department,qty,price*qty,
case when r/7%5=0 then floor(price*qty*0.1/100)*100 else 0 end,
case when r%100<4 then 'canceled' when r%100<7 then 'refunded' when r%100<9 then 'pending' else 'paid' end,
case when day<(now() at time zone 'Asia/Seoul')::date-5 then 'delivered' when r/19%10<5 then 'preparing' when r/19%10<9 then 'shipped' else 'on_hold' end,
case when r/101%100<25 then '네이버 검색' when r/101%100<50 then '네이버 쇼핑' when r/101%100<70 then '인스타그램' when r/101%100<85 then '직접 방문' when r/101%100<95 then '카카오' else '검색 광고' end,
case when r/71%100<27 then '서울' when r/71%100<56 then '경기' when r/71%100<62 then '인천' when r/71%100<69 then '부산' when r/71%100<74 then '대구' when r/71%100<79 then '대전' when r/71%100<83 then '광주' when r/71%100<90 then '강원·충청' when r/71%100<98 then '전라·경상' else '제주' end,
case when r/43%100<40 then '신용카드' when r/43%100<65 then '네이버페이' when r/43%100<80 then '카카오페이' when r/43%100<95 then '토스페이' else '계좌이체' end,r/29%100<32
from facts where at<=now() on conflict(id) do update set product_id=excluded.product_id,product_name=excluded.product_name,department=excluded.department,ordered_at=excluded.ordered_at,quantity=excluded.quantity,gross_amount=excluded.gross_amount,discount_amount=excluded.discount_amount,status=excluded.status,channel=excluded.channel,region=excluded.region,payment_method=excluded.payment_method,returning_customer=excluded.returning_customer;
select count(*) as simulated_orders,count(distinct product_id) as products,min(ordered_at) as first_sale,max(ordered_at) as last_sale,(select count(*) from orders) as real_orders from sales_simulations;`;
managementDbExec(token, ref, sql)
  .then((result) => console.log(JSON.stringify(result)))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
