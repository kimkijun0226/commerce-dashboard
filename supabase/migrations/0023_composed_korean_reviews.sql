ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_generated boolean NOT NULL DEFAULT false;

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_origin_check;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_origin_check CHECK (
  (user_id IS NOT NULL AND order_id IS NOT NULL AND source_url IS NULL AND author_name IS NULL AND NOT is_generated)
  OR
  (user_id IS NULL AND order_id IS NULL AND author_name IS NOT NULL AND length(trim(author_name)) > 0
    AND (
      (NOT is_generated AND source_url IS NOT NULL AND source_url LIKE 'https://%')
      OR (is_generated AND source_url IS NULL)
    ))
);

-- Customer INSERT policies still require a verified order and auth.uid() = user_id.
-- Composed content is separate from purchase reviews and cannot be written by customers.
