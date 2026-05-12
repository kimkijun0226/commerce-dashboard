-- ============================================================
-- 0009 - allow multiple reviews per product (drop unique)
-- ============================================================

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_user_product_unique;

