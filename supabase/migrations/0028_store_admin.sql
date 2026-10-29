CREATE TABLE IF NOT EXISTS public.store_settings (
  department text PRIMARY KEY CHECK (department IN ('fashion','beauty','home')),
  logo_url text,
  banners jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(banners) = 'array'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_settings_read ON public.store_settings;
CREATE POLICY store_settings_read ON public.store_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS store_settings_admin_write ON public.store_settings;
CREATE POLICY store_settings_admin_write ON public.store_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.store_settings TO authenticated;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled','preparing','shipped','delivered','on_hold'));
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_carrier text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;

INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('store-assets','store-assets',true,5242880,ARRAY['image/jpeg','image/png','image/webp']) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS store_assets_public_read ON storage.objects;
CREATE POLICY store_assets_public_read ON storage.objects FOR SELECT USING (bucket_id='store-assets');
DROP POLICY IF EXISTS store_assets_admin_insert ON storage.objects;
CREATE POLICY store_assets_admin_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='store-assets' AND public.is_admin());
DROP POLICY IF EXISTS store_assets_admin_update ON storage.objects;
CREATE POLICY store_assets_admin_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='store-assets' AND public.is_admin()) WITH CHECK (bucket_id='store-assets' AND public.is_admin());
NOTIFY pgrst, 'reload schema';

CREATE OR REPLACE FUNCTION public.guard_order_fulfillment() RETURNS trigger
LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF (TG_OP='INSERT' AND (NEW.fulfillment_status <> 'unfulfilled' OR NEW.shipping_carrier IS NOT NULL OR NEW.tracking_number IS NOT NULL OR NEW.shipped_at IS NOT NULL))
    OR (TG_OP='UPDATE' AND ROW(NEW.fulfillment_status,NEW.shipping_carrier,NEW.tracking_number,NEW.shipped_at) IS DISTINCT FROM ROW(OLD.fulfillment_status,OLD.shipping_carrier,OLD.tracking_number,OLD.shipped_at)) THEN
    IF NOT public.is_admin() AND coalesce(auth.role(),'') <> 'service_role' THEN RAISE EXCEPTION 'Administrator required for fulfillment changes'; END IF;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS orders_guard_fulfillment ON public.orders;
CREATE TRIGGER orders_guard_fulfillment BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.guard_order_fulfillment();

CREATE OR REPLACE FUNCTION public.get_admin_dashboard() RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required' USING ERRCODE='42501'; END IF;
  RETURN jsonb_build_object(
    'products',(SELECT count(*) FROM public.products),
    'visible',(SELECT count(*) FROM public.products WHERE status='registered'),
    'orders',(SELECT count(*) FROM public.orders),
    'revenue',(SELECT coalesce(sum(total_amount),0) FROM public.orders WHERE status='paid' AND payment_status='success'),
    'pendingShipment',(SELECT count(*) FROM public.orders WHERE status='paid' AND payment_status='success' AND fulfillment_status IN ('unfulfilled','preparing')),
    'departments',(SELECT jsonb_agg(t) FROM (SELECT department,count(*) AS count FROM public.products GROUP BY department ORDER BY department) t),
    'dailyRevenue',(SELECT jsonb_agg(t) FROM (
      SELECT to_char(d.day,'MM/DD') AS day,coalesce(sum(o.total_amount),0) AS amount
      FROM generate_series((now() AT TIME ZONE 'Asia/Seoul')::date - 6,(now() AT TIME ZONE 'Asia/Seoul')::date,interval '1 day') d(day)
      LEFT JOIN public.orders o ON (o.paid_at AT TIME ZONE 'Asia/Seoul')::date=d.day::date AND o.status='paid' AND o.payment_status='success'
      GROUP BY d.day ORDER BY d.day
    ) t)
  );
END; $$;
REVOKE ALL ON FUNCTION public.get_admin_dashboard() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard() TO authenticated;
NOTIFY pgrst,'reload schema';
