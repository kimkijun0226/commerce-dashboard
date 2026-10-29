-- Category arrays store a broad group, shopping category, then optional tags.
CREATE OR REPLACE FUNCTION public.get_catalog_categories()
RETURNS TABLE (name text, product_count bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT category, count(*)
  FROM (
    SELECT coalesce(nullif(trim(categories[2]), ''), nullif(trim(categories[1]), '')) AS category
    FROM public.products WHERE status <> 'hidden'
  ) visible
  WHERE category IS NOT NULL
  GROUP BY category
  ORDER BY category;
$$;
REVOKE ALL ON FUNCTION public.get_catalog_categories() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_catalog_categories() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_catalog_category_products(p_category text)
RETURNS SETOF public.products
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT * FROM public.products
  WHERE status <> 'hidden'
    AND coalesce(nullif(trim(categories[2]), ''), nullif(trim(categories[1]), '')) = p_category;
$$;
REVOKE ALL ON FUNCTION public.get_catalog_category_products(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_catalog_category_products(text) TO anon, authenticated, service_role;
