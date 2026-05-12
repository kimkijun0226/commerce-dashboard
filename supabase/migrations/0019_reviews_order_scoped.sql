-- ============================================================
-- 0019 - 리뷰: 주문당 상품 1건 (재주문 시 동일 상품 추가 리뷰 가능)
--        동일 주문에 동일 상품이 여러 줄이어도 리뷰는 1회
-- ============================================================

-- 1) 기존 (user_id, product_id) 유니크 제거
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_product_unique;

-- 2) 주문 FK 컬럼 (백필 전까지 nullable)
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE;

-- 3) 백필: 리뷰 생성 순서(rn) = 해당 (user, product)의 n번째 결제완료 주문에 매칭
WITH ranked_reviews AS (
  SELECT
    id,
    user_id,
    product_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, product_id
      ORDER BY created_at ASC
    ) AS rn
  FROM public.reviews
),
orders_ranked AS (
  SELECT
    o.id AS order_id,
    o.user_id,
    oi.product_id,
    ROW_NUMBER() OVER (
      PARTITION BY o.user_id, oi.product_id
      ORDER BY o.created_at ASC
    ) AS rn
  FROM public.orders o
  INNER JOIN public.order_items oi ON oi.order_id = o.id
  WHERE o.status = 'paid'
    AND o.payment_status = 'success'
)
UPDATE public.reviews r
SET order_id = o.order_id
FROM ranked_reviews rr
INNER JOIN orders_ranked o
  ON o.user_id = rr.user_id
  AND o.product_id = rr.product_id
  AND o.rn = rr.rn
WHERE r.id = rr.id;

-- 매칭되지 않은 리뷰(구매 주문 없음 등) 제거
DELETE FROM public.reviews WHERE order_id IS NULL;

ALTER TABLE public.reviews ALTER COLUMN order_id SET NOT NULL;

-- 4) 주문·상품 조합당 1건
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_order_product_unique UNIQUE (order_id, product_id);

-- 5) INSERT RLS: 본인 주문 + 해당 주문에 상품 포함 + 결제 완료
DROP POLICY IF EXISTS "reviews_insert_purchase_verified_or_admin" ON public.reviews;

CREATE POLICY "reviews_insert_order_verified_or_admin"
  ON public.reviews FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR (
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1
        FROM public.orders o
        INNER JOIN public.order_items oi ON oi.order_id = o.id
        WHERE o.id = reviews.order_id
          AND oi.product_id = reviews.product_id
          AND o.user_id = auth.uid()
          AND o.status = 'paid'
          AND o.payment_status = 'success'
      )
    )
  );

-- 6) 이전 검증용 함수 제거 (정책에서 미사용)
DROP FUNCTION IF EXISTS public.user_has_completed_purchase_for_product(uuid, uuid);
