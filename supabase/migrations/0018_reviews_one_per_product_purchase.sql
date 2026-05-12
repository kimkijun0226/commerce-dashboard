-- ============================================================
-- 0018 - 리뷰: 상품당 사용자 1건 + 결제 완료 구매자만 작성 가능
-- ============================================================

-- 1) 동일 (user_id, product_id) 중복 행 제거 — 최신 created_at 1건만 유지
DELETE FROM public.reviews
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, product_id
        ORDER BY created_at DESC
      ) AS rn
    FROM public.reviews
  ) ranked
  WHERE ranked.rn > 1
);

-- 2) 상품당 1회 작성
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_user_product_unique UNIQUE (user_id, product_id);

-- 3) RLS용: 결제 완료 주문에 해당 상품이 포함되었는지
CREATE OR REPLACE FUNCTION public.user_has_completed_purchase_for_product(
  p_user_id uuid,
  p_product_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    INNER JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = p_product_id
      AND o.user_id = p_user_id
      AND o.status = 'paid'
      AND o.payment_status = 'success'
  );
$$;

COMMENT ON FUNCTION public.user_has_completed_purchase_for_product(uuid, uuid) IS
  '사용자가 해당 상품을 결제 완료(paid+payment success) 주문으로 구매했는지';

REVOKE ALL ON FUNCTION public.user_has_completed_purchase_for_product(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_has_completed_purchase_for_product(uuid, uuid) TO authenticated;

-- 4) INSERT 정책: 본인 + 구매 검증 (관리자는 기존과 동일하게 예외)
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;

CREATE POLICY "reviews_insert_purchase_verified_or_admin"
  ON public.reviews FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR (
      auth.uid() = user_id
      AND public.user_has_completed_purchase_for_product(auth.uid(), product_id)
    )
  );
