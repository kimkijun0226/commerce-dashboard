-- ============================================================
-- Cursor Commerce Dashboard - 초기 스키마
-- auth.users 연동은 추후 추가 예정
-- ============================================================

-- user_role enum
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

COMMENT ON TYPE public.user_role IS '사용자 역할: user(일반), admin(관리자)';

-- ------------------------------------------------------------
-- 1. users
-- ------------------------------------------------------------
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text,
  role public.user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS '사용자 테이블 (auth.users 연동 추후 추가)';
COMMENT ON COLUMN public.users.email IS '이메일 (로그인 식별자)';
COMMENT ON COLUMN public.users.display_name IS '표시 이름';
COMMENT ON COLUMN public.users.role IS '역할 (user/admin)';

-- ------------------------------------------------------------
-- 2. products
-- ------------------------------------------------------------
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  sale_price numeric CHECK (sale_price IS NULL OR sale_price >= 0),
  image_url text,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'hidden', 'sold_out')),
  additional_info text,
  measurements text,
  categories text[],
  rating_average numeric,
  review_summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.products IS '상품 테이블';
COMMENT ON COLUMN public.products.status IS '노출상태: registered(판매중), hidden(숨김), sold_out(품절)';

-- ------------------------------------------------------------
-- 3. orders
-- ------------------------------------------------------------
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled', 'refunded')),
  total_amount numeric NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  subtotal_amount numeric NOT NULL DEFAULT 0 CHECK (subtotal_amount >= 0),
  shipping_fee numeric NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  discount_amount numeric NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  currency text NOT NULL DEFAULT 'USD',
  payment_status text NOT NULL DEFAULT 'requested' CHECK (payment_status IN ('requested', 'success', 'failed', 'refund_requested', 'refund_completed')),
  contact_name text,
  contact_phone text,
  contact_email text,
  shipping_name text,
  shipping_phone text,
  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_zip text,
  shipping_country text,
  toss_order_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

COMMENT ON TABLE public.orders IS '주문 테이블';
COMMENT ON COLUMN public.orders.payment_status IS '결제 상태';

-- ------------------------------------------------------------
-- 4. order_items
-- ------------------------------------------------------------
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  unit_sale_price numeric,
  product_name text,
  product_image_url text,
  line_subtotal numeric NOT NULL DEFAULT 0 CHECK (line_subtotal >= 0)
);

COMMENT ON TABLE public.order_items IS '주문 상품 항목';

-- ------------------------------------------------------------
-- 5. payments
-- ------------------------------------------------------------
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'mock',
  method text NOT NULL DEFAULT 'card',
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  transaction_id text,
  payment_key text,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);

COMMENT ON TABLE public.payments IS '결제 내역';

-- ------------------------------------------------------------
-- 6. reviews
-- ------------------------------------------------------------
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reviews IS '상품 리뷰';

-- ------------------------------------------------------------
-- 7. cart_items
-- ------------------------------------------------------------
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cart_items IS '장바구니 (user_id는 추후 auth.users.id로 변경 예정)';

-- ------------------------------------------------------------
-- 8. like_items
-- ------------------------------------------------------------
CREATE TABLE public.like_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

COMMENT ON TABLE public.like_items IS '찜하기 (한 사용자가 같은 상품 중복 찜 불가)';

-- ------------------------------------------------------------
-- 9. mcp_settings
-- ------------------------------------------------------------
CREATE TABLE public.mcp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slack_enabled boolean NOT NULL DEFAULT false,
  notion_enabled boolean NOT NULL DEFAULT false,
  notion_url text,
  notion_report_per_payment boolean NOT NULL DEFAULT false,
  notion_report_monthly_manual boolean NOT NULL DEFAULT false,
  notion_report_monthly_auto boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mcp_settings IS 'MCP 연동 설정';

-- ------------------------------------------------------------
-- 인덱스
-- ------------------------------------------------------------
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_like_items_user_id ON public.like_items(user_id);
