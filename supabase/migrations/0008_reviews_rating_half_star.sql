-- ============================================================
-- 0008 - reviews.rating allow half-star (0.5 step)
-- ============================================================

-- 기존 CHECK 제약이 있을 수 있으니 안전하게 제거 후 재생성합니다.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.reviews'::regclass
      AND contype = 'c'
      AND conname = 'reviews_rating_check'
  ) THEN
    ALTER TABLE public.reviews DROP CONSTRAINT reviews_rating_check;
  END IF;
END
$$;

-- integer → numeric (0.5 단위 저장 가능)
ALTER TABLE public.reviews
  ALTER COLUMN rating TYPE numeric
  USING rating::numeric;

-- 1.0 ~ 5.0 범위 + 0.5 step만 허용
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_rating_check
  CHECK (
    rating >= 1
    AND rating <= 5
    AND (rating * 2) = floor(rating * 2)
  );

