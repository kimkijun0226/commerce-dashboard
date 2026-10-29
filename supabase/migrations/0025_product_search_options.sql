CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS search_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS options jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Descriptions deliberately stay out: shared promotional copy creates false matches.
CREATE OR REPLACE FUNCTION public.normalize_product_search(value text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE
SET search_path = pg_catalog
AS $$ SELECT lower(regexp_replace(coalesce(value, ''), '[[:space:]]', '', 'g')); $$;

CREATE OR REPLACE FUNCTION public.product_search_document(product_name text, keywords text[])
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT public.normalize_product_search(product_name) || E'\n' ||
    coalesce((SELECT string_agg(public.normalize_product_search(keyword), E'\n')
      FROM unnest(keywords) AS keyword), '');
$$;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS search_text text
  GENERATED ALWAYS AS (public.product_search_document(name, search_keywords)) STORED;
CREATE INDEX IF NOT EXISTS products_search_text_trgm_idx
  ON public.products USING gin (search_text gin_trgm_ops);

-- Preserve merchant-entered terms. Backfill only names that identify sweat pants.
UPDATE public.products
SET search_keywords = ARRAY['스웻 팬츠', '스웨트 팬츠', '트레이닝 팬츠', '조거 팬츠', 'sweat pants']
WHERE cardinality(search_keywords) = 0
  AND name ~* '(팬츠|바지|pants|jogger)'
  AND name ~* '(스웻|스웨트|트레이닝|조거|sweat|jogger|comfy)';
