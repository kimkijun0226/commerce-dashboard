-- Reporting union: actual orders remain canonical for payment and fulfillment.
create view public.admin_sales_lines with (security_invoker=true) as
with actual_lines as (
 select o.*, i.id as line_id,i.product_id,coalesce(i.product_name,p.name,'상품 정보 없음') as item_name,
 coalesce(p.department,'unknown') as item_department,coalesce(i.quantity,0) as item_quantity,
 coalesce(i.line_subtotal,o.subtotal_amount) as gross,
 sum(coalesce(i.line_subtotal,o.subtotal_amount)) over(partition by o.id) as order_gross,
 sum(coalesce(i.line_subtotal,o.subtotal_amount)) over(partition by o.id order by i.id rows unbounded preceding) as cumulative_gross
 from public.orders o left join public.order_items i on i.order_id=o.id left join public.products p on p.id=i.product_id
 where (select public.is_admin()) and o.currency='KRW'
), actual_allocated as (
 select *,case when order_gross>0 then
 round(least(discount_amount,order_gross)*cumulative_gross/order_gross)-round(least(discount_amount,order_gross)*(cumulative_gross-gross)/order_gross)
 else 0 end as line_discount from actual_lines
)
select s.id,s.ordered_at,s.product_id,s.product_name,s.department,s.quantity,s.gross_amount::numeric,s.discount_amount::numeric,s.status,s.fulfillment,s.channel,s.region,s.payment_method,s.returning_customer
from public.sales_simulations s where (select public.is_admin())
union all
select 'ORD-'||a.id,coalesce(a.paid_at,a.created_at),a.product_id,a.item_name,a.item_department,a.item_quantity,a.gross,a.line_discount,
case when a.status='paid' and a.payment_status<>'success' then 'pending' else a.status end,
case when a.fulfillment_status='unfulfilled' then 'preparing' else a.fulfillment_status end,
'직접 결제',coalesce(nullif(a.shipping_city,''),'미입력'),
coalesce((select nullif(pay.method,'') from public.payments pay where pay.order_id=a.id and pay.status='success' order by pay.approved_at desc nulls last,pay.created_at desc limit 1),'결제 수단 미확인'),
exists(select 1 from public.orders prior where prior.user_id=a.user_id and prior.status='paid' and prior.payment_status='success' and prior.created_at<a.created_at)
from actual_allocated a;
revoke all on public.admin_sales_lines from public,anon;
grant select on public.admin_sales_lines to authenticated;

create function public.get_admin_combined_dashboard() returns jsonb language plpgsql security invoker set search_path=public as $$
declare actual jsonb; seeded jsonb;
begin
 if not public.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 actual:=public.get_admin_dashboard(); seeded:=public.get_admin_payment_preview();
 return actual || jsonb_build_object(
 'orders',(actual->>'orders')::bigint+(seeded->>'orders')::bigint,
 'revenue',(actual->>'revenue')::numeric+(seeded->>'revenue')::numeric,
 'pendingShipment',(actual->>'pendingShipment')::bigint+(seeded->>'pendingShipment')::bigint,
 'paymentCount',(select count(*) from orders where status='paid' and payment_status='success')+(seeded->>'paymentCount')::bigint,
 'dailyRevenue',(select jsonb_agg(t order by t.day) from (
 select s.value->>'day' as day,(s.value->>'amount')::numeric+coalesce((select sum(o.total_amount) from public.orders o where o.status='paid' and o.payment_status='success' and (o.paid_at at time zone 'Asia/Seoul')::date=(s.value->>'day')::date),0) as amount
 from jsonb_array_elements(seeded->'dailyRevenue') s(value)
 ) t)
 );
end $$;
revoke all on function public.get_admin_combined_dashboard() from public,anon;
grant execute on function public.get_admin_combined_dashboard() to authenticated;

create function public.get_admin_sales(p_days integer default 30, p_department text default '', p_page integer default 1, p_status text default '', p_date date default null) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare result jsonb; today date := (now() at time zone 'Asia/Seoul')::date;
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501'; end if;
 if p_days not in (7,30,90) or p_page < 1 or p_page > 10000 or p_department not in ('','fashion','beauty','home') or p_status not in ('','paid','canceled','refunded','pending') then raise exception 'Invalid sales filters' using errcode='22023'; end if;
 with source as materialized (
 select *, (ordered_at at time zone 'Asia/Seoul')::date as day,
 case when status='paid' then gross_amount-discount_amount else 0 end as net
 from admin_sales_lines where ordered_at >= ((today-2*p_days+1)::timestamp at time zone 'Asia/Seoul')
 and ordered_at <= now() and (p_department='' or department=p_department)
 ), current_sales as materialized(select * from source where day>=today-p_days+1),
 daily as (select d::date as day,coalesce(sum(net),0) as revenue,count(distinct s.id) as orders from generate_series(today-p_days+1,today,interval '1 day') d left join current_sales s on s.day=d::date group by d),
 products as(select product_id,product_name,department,sum(net) as revenue,sum(quantity) filter(where status='paid') as units,count(distinct id) as orders from current_sales group by product_id,product_name,department),
 filtered as materialized(select * from current_sales where (p_status='' or status=p_status) and (p_date is null or day=p_date)),
 order_rows as(select id,min(ordered_at) as ordered_at,case when count(distinct product_id)=1 then min(product_id::text)::uuid else null end as product_id,string_agg(distinct product_name,' / ' order by product_name) as product_name,case when count(distinct department)=1 then min(department) else 'mixed' end as department,sum(quantity) as quantity,sum(gross_amount) as gross_amount,sum(discount_amount) as discount_amount,min(status) as status,min(fulfillment) as fulfillment,min(channel) as channel,min(region) as region,min(payment_method) as payment_method,bool_or(returning_customer) as returning_customer,sum(net) as net from filtered group by id),
 page_rows as(select * from order_rows order by ordered_at desc,id limit 25 offset (p_page-1)*25)
 select jsonb_build_object(
 'start',today-p_days+1,'end',today,'updatedAt',now(),
 'summary',(select jsonb_build_object('orders',count(distinct id),'paid',count(distinct id) filter(where status='paid'),'revenue',coalesce(sum(net),0),'units',coalesce(sum(quantity) filter(where status='paid'),0),'discount',coalesce(sum(discount_amount) filter(where status='paid'),0),'refund',coalesce(sum(gross_amount-discount_amount) filter(where status='refunded'),0),'canceled',count(distinct id) filter(where status='canceled'),'returning',count(distinct id) filter(where returning_customer),'pendingShipment',count(distinct id) filter(where status='paid' and fulfillment='preparing')) from current_sales),
 'previousRevenue',(select coalesce(sum(net),0) from source where day<today-p_days+1),
 'daily',(select jsonb_agg(to_jsonb(daily) order by day) from daily),
 'products',(select coalesce(jsonb_agg(to_jsonb(p) order by revenue desc,product_name),'[]') from (select * from products order by revenue desc,product_name limit 50) p),
 'departments',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from (select department as label,sum(net) as revenue,count(distinct id) as orders from current_sales group by department order by sum(net) desc) d),
 'channels',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from (select channel as label,sum(net) as revenue,count(distinct id) as orders from current_sales group by channel order by count(distinct id) desc) d),
 'regions',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from (select region as label,sum(net) as revenue,count(distinct id) as orders from current_sales group by region order by count(distinct id) desc) d),
 'payments',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from (select payment_method as label,sum(net) as revenue,count(distinct id) as orders from current_sales group by payment_method order by count(distinct id) desc) d),
 'statuses',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from (select status as label,sum(net) as revenue,count(distinct id) as orders from current_sales group by status order by count(distinct id) desc) d),
 'fulfillments',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from (select fulfillment as label,sum(net) as revenue,count(distinct id) as orders from current_sales where status='paid' group by fulfillment order by count(distinct id) desc) d),
 'hours',(select coalesce(jsonb_agg(to_jsonb(d) order by label),'[]') from (select to_char(ordered_at at time zone 'Asia/Seoul','HH24') as label,sum(net) as revenue,count(distinct id) as orders from current_sales group by 1) d),
 'total',(select count(*) from order_rows),'rows',(select coalesce(jsonb_agg(to_jsonb(page_rows) order by ordered_at desc,id),'[]') from page_rows)
 ) into result;
 return result;
end $$;
revoke all on function public.get_admin_sales(integer,text,integer,text,date) from public,anon;
grant execute on function public.get_admin_sales(integer,text,integer,text,date) to authenticated;

notify pgrst,'reload schema';
