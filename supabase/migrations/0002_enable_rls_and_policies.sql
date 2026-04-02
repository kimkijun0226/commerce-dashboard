-- ============================================================
-- RLS(Row Level Security) 활성화 및 정책
-- auth.uid() 기반 역할/소유권 접근 제어
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  );
$$;

-- 1. public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
CREATE POLICY "users_select_own_or_admin"
  ON public.users FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_or_admin" ON public.users;
CREATE POLICY "users_update_own_or_admin"
  ON public.users FOR UPDATE
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "users_delete_admin_only" ON public.users;
CREATE POLICY "users_delete_admin_only"
  ON public.users FOR DELETE
  USING (public.is_admin());

-- 2. public.products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_public_or_admin" ON public.products;
CREATE POLICY "products_select_public_or_admin"
  ON public.products FOR SELECT
  USING (status != 'hidden' OR public.is_admin());

DROP POLICY IF EXISTS "products_insert_admin_only" ON public.products;
CREATE POLICY "products_insert_admin_only"
  ON public.products FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_update_admin_only" ON public.products;
CREATE POLICY "products_update_admin_only"
  ON public.products FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "products_delete_admin_only" ON public.products;
CREATE POLICY "products_delete_admin_only"
  ON public.products FOR DELETE USING (public.is_admin());

-- 3. public.orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own_or_admin" ON public.orders;
CREATE POLICY "orders_select_own_or_admin"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_update_admin_only" ON public.orders;
CREATE POLICY "orders_update_admin_only"
  ON public.orders FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "orders_delete_admin_only" ON public.orders;
CREATE POLICY "orders_delete_admin_only"
  ON public.orders FOR DELETE USING (public.is_admin());

-- 4. public.order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own_or_admin" ON public.order_items;
CREATE POLICY "order_items_select_own_or_admin"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "order_items_insert_own_or_admin" ON public.order_items;
CREATE POLICY "order_items_insert_own_or_admin"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "order_items_update_own_or_admin" ON public.order_items;
CREATE POLICY "order_items_update_own_or_admin"
  ON public.order_items FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "order_items_delete_own_or_admin" ON public.order_items;
CREATE POLICY "order_items_delete_own_or_admin"
  ON public.order_items FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
    OR public.is_admin()
  );

-- 5. public.payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_own_or_admin" ON public.payments;
CREATE POLICY "payments_select_own_or_admin"
  ON public.payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = payments.order_id AND o.user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "payments_insert_admin_only" ON public.payments;
CREATE POLICY "payments_insert_admin_only"
  ON public.payments FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "payments_update_admin_only" ON public.payments;
CREATE POLICY "payments_update_admin_only"
  ON public.payments FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "payments_delete_admin_only" ON public.payments;
CREATE POLICY "payments_delete_admin_only"
  ON public.payments FOR DELETE USING (public.is_admin());

-- 6. public.reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
CREATE POLICY "reviews_select_all"
  ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "reviews_delete_own_or_admin" ON public.reviews;
CREATE POLICY "reviews_delete_own_or_admin"
  ON public.reviews FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- 7. public.cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items_all_own" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_select_own" ON public.cart_items;
CREATE POLICY "cart_items_select_own"
  ON public.cart_items FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "cart_items_insert_own" ON public.cart_items;
CREATE POLICY "cart_items_insert_own"
  ON public.cart_items FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "cart_items_update_own" ON public.cart_items;
CREATE POLICY "cart_items_update_own"
  ON public.cart_items FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "cart_items_delete_own" ON public.cart_items;
CREATE POLICY "cart_items_delete_own"
  ON public.cart_items FOR DELETE USING (user_id = auth.uid());

-- 8. public.like_items
ALTER TABLE public.like_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "like_items_select_own" ON public.like_items;
CREATE POLICY "like_items_select_own"
  ON public.like_items FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "like_items_insert_own" ON public.like_items;
CREATE POLICY "like_items_insert_own"
  ON public.like_items FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "like_items_delete_own" ON public.like_items;
CREATE POLICY "like_items_delete_own"
  ON public.like_items FOR DELETE USING (user_id = auth.uid());

-- 9. public.mcp_settings
ALTER TABLE public.mcp_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mcp_settings_all_admin" ON public.mcp_settings;
CREATE POLICY "mcp_settings_all_admin"
  ON public.mcp_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
