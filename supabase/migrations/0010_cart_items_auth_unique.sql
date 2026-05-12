-- ============================================================
-- 0010 - cart_items auth FK + unique(user_id, product_id)
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cart_items_user_id_fkey'
      AND conrelid = 'public.cart_items'::regclass
  ) THEN
    ALTER TABLE public.cart_items
      DROP CONSTRAINT cart_items_user_id_fkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cart_items_auth_user_fk'
      AND conrelid = 'public.cart_items'::regclass
  ) THEN
    ALTER TABLE public.cart_items
      ADD CONSTRAINT cart_items_auth_user_fk
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'cart_items'
      AND indexname = 'cart_items_user_product_unique'
  ) THEN
    CREATE UNIQUE INDEX cart_items_user_product_unique
      ON public.cart_items (user_id, product_id);
  END IF;
END
$$;

