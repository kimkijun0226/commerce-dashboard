alter table public.sales_simulations
 add column shipping_carrier text,
 add column tracking_number text,
 add column shipped_at timestamptz,
 add column updated_at timestamptz not null default now();

create view public.admin_manage_orders with(security_invoker=true) as
 select id::text,created_at,shipping_name,total_amount,status,payment_status,fulfillment_status,shipping_carrier,tracking_number
 from public.orders where (select public.is_admin())
 union all
 select id,ordered_at,'구매자 '||right(id,4),gross_amount-discount_amount,status,
 case when status='paid' then 'success' when status='refunded' then 'refund_completed' else 'requested' end,
 fulfillment,shipping_carrier,tracking_number
 from public.sales_simulations where (select public.is_admin());
revoke all on public.admin_manage_orders from public,anon;
grant select on public.admin_manage_orders to authenticated;

create function public.get_admin_orders(p_page integer default 1,p_q text default '',p_fulfillment text default '',p_payment text default '') returns jsonb
language plpgsql security invoker set search_path=public as $$
declare result jsonb;
begin
 if not public.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 if p_page<1 or p_page>10000 or length(p_q)>100 or p_fulfillment not in ('','unfulfilled','preparing','shipped','delivered','on_hold') or p_payment not in ('','paid') then raise exception 'Invalid order filters'; end if;
 with filtered as materialized(
 select * from admin_manage_orders where (p_q='' or position(lower(p_q) in lower(id||' '||coalesce(shipping_name,'')))>0)
 and (p_fulfillment='' or fulfillment_status=p_fulfillment or (p_fulfillment='preparing' and fulfillment_status='unfulfilled'))
 and (p_payment='' or (status='paid' and payment_status='success'))
 ), page_rows as(select * from filtered order by created_at desc,id desc limit 20 offset (p_page-1)*20)
 select jsonb_build_object('total',(select count(*) from filtered),'rows',(select coalesce(jsonb_agg(to_jsonb(page_rows) order by created_at desc,id desc),'[]') from page_rows)) into result;
 return result;
end $$;
revoke all on function public.get_admin_orders(integer,text,text,text) from public,anon;
grant execute on function public.get_admin_orders(integer,text,text,text) to authenticated;

create function public.get_admin_portfolio_order(p_id text) returns jsonb language plpgsql security invoker set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 return(select to_jsonb(s) from sales_simulations s where id=p_id);
end $$;
revoke all on function public.get_admin_portfolio_order(text) from public,anon;
grant execute on function public.get_admin_portfolio_order(text) to authenticated;

create function public.save_portfolio_fulfillment(p_id text,p_updated_at timestamptz,p_status text,p_carrier text,p_tracking text) returns boolean
language plpgsql security definer set search_path=public as $$
declare current_order public.sales_simulations; affected integer;
begin
 if not public.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 if p_status not in ('preparing','shipped','delivered','on_hold') or length(p_carrier)>50 or length(p_tracking)>100 then raise exception 'Invalid fulfillment'; end if;
 select * into current_order from sales_simulations where id=p_id for update;
 if not found or current_order.updated_at is distinct from p_updated_at then return false; end if;
 if p_status<>'on_hold' and current_order.status<>'paid' then raise exception 'Paid order required'; end if;
 if current_order.fulfillment='delivered' and p_status<>'delivered' then raise exception 'Delivered order cannot be reversed'; end if;
 if p_status in ('shipped','delivered') and (coalesce(trim(p_carrier),'')='' or coalesce(trim(p_tracking),'')='') then raise exception 'Carrier and tracking required'; end if;
 update sales_simulations set fulfillment=p_status,shipping_carrier=nullif(trim(p_carrier),''),tracking_number=nullif(trim(p_tracking),''),
 shipped_at=case when p_status in ('shipped','delivered') then coalesce(shipped_at,now()) else shipped_at end,
 updated_at=clock_timestamp() where id=p_id and updated_at=p_updated_at;
 get diagnostics affected=row_count;
 return affected=1;
end $$;
revoke all on function public.save_portfolio_fulfillment(text,timestamptz,text,text,text) from public,anon;
grant execute on function public.save_portfolio_fulfillment(text,timestamptz,text,text,text) to authenticated;
notify pgrst,'reload schema';
