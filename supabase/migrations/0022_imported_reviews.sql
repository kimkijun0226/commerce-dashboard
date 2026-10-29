-- External reviews have provenance, not fabricated accounts or purchases.
ALTER TABLE public.reviews
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN order_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS author_name text;

DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.reviews'::regclass AND conname = 'reviews_origin_check') THEN
ALTER TABLE public.reviews ADD CONSTRAINT reviews_origin_check CHECK (
  (user_id IS NOT NULL AND order_id IS NOT NULL AND source_url IS NULL AND author_name IS NULL)
  OR
  (user_id IS NULL AND order_id IS NULL AND source_url IS NOT NULL
    AND source_url LIKE 'https://%' AND author_name IS NOT NULL AND length(trim(author_name)) > 0)
);
END IF;
END $$;

-- Existing INSERT/UPDATE policies require auth.uid() = user_id for customers.
-- NULL user_id prevents customers from inserting or editing external reviews.
