-- Synthetic transactions live outside customer orders, payments and inventory.
create table public.sales_simulations (
 id text primary key,
 ordered_at timestamptz not null,
 product_id uuid references public.products(id) on delete set null,
 product_name text not null,
 department text not null check (department in ('fashion','beauty','home')),
 quantity integer not null check(quantity between 1 and 5),
 gross_amount bigint not null check(gross_amount >= 0),
 discount_amount bigint not null check(discount_amount between 0 and gross_amount),
 status text not null check(status in ('paid','canceled','refunded','pending')),
 fulfillment text not null check(fulfillment in ('preparing','shipped','delivered','on_hold')),
 channel text not null,
 region text not null,
 payment_method text not null,
 returning_customer boolean not null
);
create index sales_simulations_date_idx on public.sales_simulations(ordered_at desc);
create index sales_simulations_department_date_idx on public.sales_simulations(department,ordered_at desc);
alter table public.sales_simulations enable row level security;
grant select on public.sales_simulations to authenticated;
create policy "Admins read simulated sales" on public.sales_simulations for select to authenticated using(public.is_admin());

create function public.get_sales_simulation(p_days integer default 30, p_department text default '', p_page integer default 1, p_status text default '', p_date date default null) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare result jsonb; today date := (now() at time zone 'Asia/Seoul')::date;
begin
 if not public.is_admin() then raise exception 'Admin access required' using errcode='42501'; end if;
 if p_days not in (7,30,90) or p_page < 1 or p_page > 10000 or p_department not in ('','fashion','beauty','home') or p_status not in ('','paid','canceled','refunded','pending') then raise exception 'Invalid sales filters' using errcode='22023'; end if;
 with source as materialized (
 select *, (ordered_at at time zone 'Asia/Seoul')::date as day,
 case when status='paid' then gross_amount-discount_amount else 0 end as net
 from sales_simulations where ordered_at >= ((today-2*p_days+1)::timestamp at time zone 'Asia/Seoul')
 and ordered_at <= now() and (p_department='' or department=p_department)
 ), current_sales as materialized(select * from source where day>=today-p_days+1),
 daily as (select d::date as day,coalesce(sum(net),0) as revenue,count(s.id) as orders from generate_series(today-p_days+1,today,interval '1 day') d left join current_sales s on s.day=d::date group by d),
 products as(select product_id,product_name,department,sum(net) as revenue,sum(quantity) filter(where status='paid') as units,count(*) as orders from current_sales group by product_id,product_name,department),
 filtered as materialized(select * from current_sales where (p_status='' or status=p_status) and (p_date is null or day=p_date)),
 page_rows as(select * from filtered order by ordered_at desc,id limit 25 offset (p_page-1)*25)
 select jsonb_build_object(
 'start',today-p_days+1,'end',today,'updatedAt',now(),
 'summary',(select jsonb_build_object('orders',count(*),'paid',count(*) filter(where status='paid'),'revenue',coalesce(sum(net),0),'units',coalesce(sum(quantity) filter(where status='paid'),0),'discount',coalesce(sum(discount_amount) filter(where status='paid'),0),'refund',coalesce(sum(gross_amount-discount_amount) filter(where status='refunded'),0),'canceled',count(*) filter(where status='canceled'),'returning',count(*) filter(where returning_customer),'pendingShipment',count(*) filter(where status='paid' and fulfillment='preparing')) from current_sales),
 'previousRevenue',(select coalesce(sum(net),0) from source where day<today-p_days+1),
 'daily',(select jsonb_agg(to_jsonb(daily) order by day) from daily),
 'products',(select coalesce(jsonb_agg(to_jsonb(p) order by revenue desc,product_name),'[]') from (select * from products order by revenue desc,product_name limit 50) p),
 'departments',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from (select department as label,sum(net) as revenue,count(*) as orders from current_sales group by department order by sum(net) desc) d),
 'channels',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from (select channel as label,sum(net) as revenue,count(*) as orders from current_sales group by channel order by count(*) desc) d),
 'regions',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from (select region as label,sum(net) as revenue,count(*) as orders from current_sales group by region order by count(*) desc) d),
 'payments',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from (select payment_method as label,sum(net) as revenue,count(*) as orders from current_sales group by payment_method order by count(*) desc) d),
 'statuses',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from (select status as label,sum(net) as revenue,count(*) as orders from current_sales group by status order by count(*) desc) d),
 'fulfillments',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from (select fulfillment as label,sum(net) as revenue,count(*) as orders from current_sales where status='paid' group by fulfillment order by count(*) desc) d),
 'hours',(select coalesce(jsonb_agg(to_jsonb(d) order by label),'[]') from (select to_char(ordered_at at time zone 'Asia/Seoul','HH24') as label,sum(net) as revenue,count(*) as orders from current_sales group by 1) d),
 'total',(select count(*) from filtered),'rows',(select coalesce(jsonb_agg(to_jsonb(page_rows) order by ordered_at desc,id),'[]') from page_rows)
 ) into result;
 return result;
end $$;
revoke all on function public.get_sales_simulation(integer,text,integer,text,date) from public,anon;
grant execute on function public.get_sales_simulation(integer,text,integer,text,date) to authenticated;
