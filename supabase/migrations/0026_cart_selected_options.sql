-- Preserve each variant independently; existing carts and orders have no selection.
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS selected_options jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_options jsonb NOT NULL DEFAULT '{}'::jsonb;
DROP INDEX IF EXISTS public.cart_items_user_product_unique;
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_user_product_options_unique
  ON public.cart_items (user_id, product_id, selected_options);
