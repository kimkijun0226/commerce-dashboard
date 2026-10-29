-- One request-level role check instead of one role lookup per sales row.
-- The existing administrator requirement and security-invoker RPC remain intact.
alter policy "Admins read simulated sales" on public.sales_simulations
using ((select public.is_admin()));
