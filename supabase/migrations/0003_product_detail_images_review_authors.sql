-- 상품 상세 이미지 전용 컬럼 + 리뷰 작성자 표시용 사용자 조회 허용

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS detail_image_urls text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.products.detail_image_urls IS '상품 상세정보 탭용 이미지 URL 배열';

UPDATE public.products
SET detail_image_urls = ARRAY[image_url]::text[]
WHERE image_url IS NOT NULL
  AND cardinality(detail_image_urls) = 0;

-- 리뷰가 있는 사용자는 PDP에서 display_name 조회(embed) 가능하도록
DROP POLICY IF EXISTS "users_select_if_has_review" ON public.users;
CREATE POLICY "users_select_if_has_review"
  ON public.users FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.reviews r WHERE r.user_id = users.id)
  );
