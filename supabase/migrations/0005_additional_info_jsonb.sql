-- additional_info: 텍스트 → JSON 객체(jsonb), additional_info_specs 컬럼 제거

DO $$
DECLARE
  col_specs boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'additional_info_specs'
  ) INTO col_specs;

  ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS additional_info_new jsonb NOT NULL DEFAULT '{}'::jsonb;

  IF col_specs THEN
    UPDATE public.products
    SET additional_info_new = COALESCE(additional_info_specs, '{}'::jsonb);
  END IF;

  UPDATE public.products p
  SET additional_info_new = CASE
    WHEN p.additional_info IS NULL OR btrim(p.additional_info::text) = '' THEN p.additional_info_new
    WHEN btrim(p.additional_info::text) ~ '^\s*\{' THEN
      p.additional_info_new || btrim(p.additional_info::text)::jsonb
    ELSE
      p.additional_info_new
      || jsonb_build_object('notes', to_jsonb(btrim(p.additional_info::text)))
  END;

  ALTER TABLE public.products DROP COLUMN IF EXISTS additional_info_specs;

  ALTER TABLE public.products DROP COLUMN additional_info;

  ALTER TABLE public.products RENAME COLUMN additional_info_new TO additional_info;

  COMMENT ON COLUMN public.products.additional_info IS 'Additional info tab: JSON object (key-value rows)';
END $$;
