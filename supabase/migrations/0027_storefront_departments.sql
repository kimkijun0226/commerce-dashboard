ALTER TABLE public.products ADD COLUMN IF NOT EXISTS department text NOT NULL DEFAULT 'fashion' CHECK (department IN ('fashion', 'beauty', 'home'));
CREATE INDEX IF NOT EXISTS products_department_catalog_idx ON public.products (department, status, created_at DESC, id DESC);
DROP FUNCTION IF EXISTS public.get_catalog_categories();
CREATE OR REPLACE FUNCTION public.get_catalog_categories(p_department text DEFAULT 'fashion')
RETURNS TABLE (name text, product_count bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT category, count(*) FROM (
    SELECT coalesce(nullif(trim(categories[2]), ''), nullif(trim(categories[1]), '')) category
    FROM public.products WHERE status <> 'hidden' AND department = p_department
  ) visible WHERE category IS NOT NULL GROUP BY category ORDER BY category;
$$;
REVOKE ALL ON FUNCTION public.get_catalog_categories(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_catalog_categories(text) TO anon, authenticated, service_role;
DROP FUNCTION IF EXISTS public.get_catalog_category_products(text);
CREATE OR REPLACE FUNCTION public.get_catalog_category_products(p_category text, p_department text DEFAULT 'fashion')
RETURNS SETOF public.products LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT * FROM public.products WHERE status <> 'hidden' AND department = p_department
    AND coalesce(nullif(trim(categories[2]), ''), nullif(trim(categories[1]), '')) = p_category;
$$;
REVOKE ALL ON FUNCTION public.get_catalog_category_products(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_catalog_category_products(text, text) TO anon, authenticated, service_role;
NOTIFY pgrst, 'reload schema';
