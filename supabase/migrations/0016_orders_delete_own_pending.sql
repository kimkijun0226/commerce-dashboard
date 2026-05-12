-- 체크아웃 롤백: 결제 행 생성 실패 시 본인 pending 주문 삭제 허용 (기존은 관리자만 DELETE)

DROP POLICY IF EXISTS "orders_delete_admin_only" ON public.orders;
CREATE POLICY "orders_delete_own_pending_or_admin"
  ON public.orders FOR DELETE
  USING (
    public.is_admin()
    OR (user_id = auth.uid() AND status = 'pending')
  );
