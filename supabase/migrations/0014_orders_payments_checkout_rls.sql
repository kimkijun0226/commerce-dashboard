-- 체크아웃: 본인 주문에 대한 payments 생성/갱신, 본인 orders 갱신(결제 반영)

DROP POLICY IF EXISTS "orders_update_admin_only" ON public.orders;
CREATE POLICY "orders_update_own_or_admin"
  ON public.orders FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "payments_insert_admin_only" ON public.payments;
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

DROP POLICY IF EXISTS "payments_update_admin_only" ON public.payments;
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
