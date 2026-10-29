create table public.sales_simulation_payments (
 sale_id text primary key references public.sales_simulations(id) on delete cascade,
 paid_at timestamptz not null,
 amount bigint not null check(amount >= 0),
 payment_method text not null,
 source text not null default 'simulation' check(source='simulation')
);
create index sales_simulation_payments_paid_at_idx on public.sales_simulation_payments(paid_at);
alter table public.sales_simulation_payments enable row level security;
grant select on public.sales_simulation_payments to authenticated;
create policy "Admins read simulated payments" on public.sales_simulation_payments for select to authenticated using((select public.is_admin()));
create function public.get_admin_payment_preview() returns jsonb language plpgsql security invoker set search_path=public as $$
declare result jsonb;
begin
 if not public.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 result:=public.get_admin_dashboard();
 return result || jsonb_build_object(
 'orders',(select count(*) from sales_simulations),
 'revenue',(select coalesce(sum(p.amount),0) from sales_simulation_payments p join sales_simulations s on s.id=p.sale_id where s.status='paid'),
 'paymentCount',(select count(*) from sales_simulation_payments p join sales_simulations s on s.id=p.sale_id where s.status='paid'),
 'pendingShipment',(select count(*) from sales_simulation_payments p join sales_simulations s on s.id=p.sale_id where s.status='paid' and s.fulfillment='preparing'),
 'dailyRevenue',(select jsonb_agg(t order by t.day) from (
 select to_char(d.day,'YYYY-MM-DD') as day,coalesce(sum(p.amount) filter(where s.status='paid'),0) as amount
 from generate_series((now() at time zone 'Asia/Seoul')::date-6,(now() at time zone 'Asia/Seoul')::date,interval '1 day') d(day)
 left join sales_simulation_payments p on p.paid_at >= (d.day::date::timestamp at time zone 'Asia/Seoul') and p.paid_at < ((d.day::date+1)::timestamp at time zone 'Asia/Seoul')
 left join sales_simulations s on s.id=p.sale_id group by d.day
 ) t)
 );
end $$;
revoke all on function public.get_admin_payment_preview() from public,anon;
grant execute on function public.get_admin_payment_preview() to authenticated;
notify pgrst,'reload schema';
