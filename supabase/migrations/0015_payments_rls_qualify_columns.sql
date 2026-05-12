-- INSERT WITH CHECK에서 payments.order_id 같은 한정 컬럼은 새 행 바인딩이 실패할 수 있음.
-- 비한정 컬럼명(order_id)으로 정책 재생성.

DROP POLICY IF EXISTS "payments_insert_own_order_or_admin" ON public.payments;
CREATE POLICY "payments_insert_own_order_or_admin"
  ON public.payments FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR (
      user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND o.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "payments_update_own_or_admin" ON public.payments;
CREATE POLICY "payments_update_own_or_admin"
  ON public.payments FOR UPDATE
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );
