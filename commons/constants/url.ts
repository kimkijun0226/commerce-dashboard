export type RouteAccess = "public" | "authenticated" | "admin";

export const AUTH_URLS = {
  LOGIN: "/login",
  SIGNUP: "/signup",
} as const;

/** 회원 전용(마이페이지·주문 내역 등) */
export const ACCOUNT_URLS = {
  ACCOUNT: "/account",
  ORDERS: "/account/orders",
} as const;

/**
 * 쇼핑몰 공개·구매 플로우.
 * Figma: Homepage, Product, Cart, Checkout, Order complete
 */
export const COMMERCE_URLS = {
  HOME: "/",
  PRODUCTS: "/products",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_COMPLETE: "/checkout/complete",
  PRODUCT_DETAIL: (productId: string) =>
    `/products/${encodeURIComponent(productId)}`,
} as const;

/** 상품 상세 경로 (`COMMERCE_URLS.PRODUCT_DETAIL` 와 동일) */
export function getProductDetailUrl(productId: string): string {
  return COMMERCE_URLS.PRODUCT_DETAIL(productId);
}

/**
 * 관리자 영역.
 * Figma: Dashboard, Products, Order Management, Customers, Stock, Transaction, Settings, Manage Admins, 연동 설정
 */
export const ADMIN_URLS = {
  DASHBOARD: "/admin",
  ORDERS: "/admin/orders",
  PRODUCTS: "/admin/products",
  PRODUCT_NEW: "/admin/products/new",
  CUSTOMERS: "/admin/customers",
  STOCK: "/admin/stock",
  TRANSACTIONS: "/admin/transactions",
  SETTINGS: "/admin/settings",
  SETTINGS_NOTION: "/admin/settings/notion",
  SETTINGS_SLACK: "/admin/settings/slack",
  MANAGE_ADMINS: "/admin/manage-admins",
  ORDER_DETAIL: (orderId: string) =>
    `/admin/orders/${encodeURIComponent(orderId)}`,
} as const;

export const ROUTE_CONFIG_MAP = {
  [AUTH_URLS.LOGIN]: "public",
  [AUTH_URLS.SIGNUP]: "public",
  [COMMERCE_URLS.HOME]: "public",
  [COMMERCE_URLS.PRODUCTS]: "public",
  [COMMERCE_URLS.CART]: "authenticated",
  [COMMERCE_URLS.CHECKOUT]: "authenticated",
  [COMMERCE_URLS.ORDER_COMPLETE]: "authenticated",
  [ACCOUNT_URLS.ACCOUNT]: "authenticated",
  [ACCOUNT_URLS.ORDERS]: "authenticated",
  [ADMIN_URLS.DASHBOARD]: "admin",
  [ADMIN_URLS.ORDERS]: "admin",
  [ADMIN_URLS.PRODUCTS]: "admin",
  [ADMIN_URLS.PRODUCT_NEW]: "admin",
  [ADMIN_URLS.CUSTOMERS]: "admin",
  [ADMIN_URLS.STOCK]: "admin",
  [ADMIN_URLS.TRANSACTIONS]: "admin",
  [ADMIN_URLS.SETTINGS]: "admin",
  [ADMIN_URLS.SETTINGS_NOTION]: "admin",
  [ADMIN_URLS.SETTINGS_SLACK]: "admin",
  [ADMIN_URLS.MANAGE_ADMINS]: "admin",
} as const satisfies Record<string, RouteAccess>;

const PRODUCT_DETAIL_PREFIX = `${COMMERCE_URLS.PRODUCTS}/`;
/** `ADMIN_URLS.ORDER_DETAIL` 과 동일 접두사 */
const ADMIN_ORDER_DETAIL_PREFIX = `${ADMIN_URLS.ORDERS}/`;

function normalizePathname(pathname: string): string {
  const path = pathname.split("?")[0] ?? pathname;
  if (path !== "/" && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function isProductDetailPath(path: string): boolean {
  return (
    path.startsWith(PRODUCT_DETAIL_PREFIX) &&
    path.length > PRODUCT_DETAIL_PREFIX.length
  );
}

function isAdminOrderDetailPath(path: string): boolean {
  return (
    path.startsWith(ADMIN_ORDER_DETAIL_PREFIX) &&
    path.length > ADMIN_ORDER_DETAIL_PREFIX.length
  );
}

/**
 * 정적 경로는 ROUTE_CONFIG_MAP 기준.
 * 동적: `/products/[productId]` → public, `/admin/orders/[orderId]` → admin
 */
export function getRouteAccess(pathname: string): RouteAccess | undefined {
  const path = normalizePathname(pathname);
  if (path in ROUTE_CONFIG_MAP) {
    return ROUTE_CONFIG_MAP[path as keyof typeof ROUTE_CONFIG_MAP];
  }
  if (isProductDetailPath(path)) return "public";
  if (isAdminOrderDetailPath(path)) return "admin";
  return undefined;
}

export type AuthUrlPath = (typeof AUTH_URLS)[keyof typeof AUTH_URLS];
export type AccountUrlPath = (typeof ACCOUNT_URLS)[keyof typeof ACCOUNT_URLS];
export type CommerceStaticUrlPath = {
  [K in keyof typeof COMMERCE_URLS]: (typeof COMMERCE_URLS)[K] extends string
    ? (typeof COMMERCE_URLS)[K]
    : never;
}[keyof typeof COMMERCE_URLS];
export type AdminStaticUrlPath = {
  [K in keyof typeof ADMIN_URLS]: (typeof ADMIN_URLS)[K] extends string
    ? (typeof ADMIN_URLS)[K]
    : never;
}[keyof typeof ADMIN_URLS];
export type RouteConfigPath = keyof typeof ROUTE_CONFIG_MAP;
