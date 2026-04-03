export type RouteAccess = "public" | "authenticated" | "admin";

export const AUTH_URLS = {
  LOGIN: "/login",
  SIGNUP: "/signup",
} as const;

export const ACCOUNT_URLS = {
  ACCOUNT: "/account",
} as const;

export const COMMERCE_URLS = {
  HOME: "/",
  PRODUCTS: "/products",
  CART: "/cart",
  CHECKOUT: "/checkout",
  PRODUCT_DETAIL: (productId: string) =>
    `/products/${encodeURIComponent(productId)}` as const,
} as const;

export const ADMIN_URLS = {
  DASHBOARD: "/admin",
  ORDERS: "/admin/orders",
  PRODUCTS: "/admin/products",
} as const;

export const ROUTE_CONFIG_MAP = {
  [AUTH_URLS.LOGIN]: "public",
  [AUTH_URLS.SIGNUP]: "public",
  [COMMERCE_URLS.HOME]: "public",
  [COMMERCE_URLS.PRODUCTS]: "public",
  [COMMERCE_URLS.CART]: "authenticated",
  [COMMERCE_URLS.CHECKOUT]: "authenticated",
  [ACCOUNT_URLS.ACCOUNT]: "authenticated",
  [ADMIN_URLS.DASHBOARD]: "admin",
  [ADMIN_URLS.ORDERS]: "admin",
  [ADMIN_URLS.PRODUCTS]: "admin",
} as const satisfies Record<string, RouteAccess>;

const PRODUCT_DETAIL_PREFIX = `${COMMERCE_URLS.PRODUCTS}/`;

function normalizePathname(pathname: string): string {
  const path = pathname.split("?")[0] ?? pathname;
  if (path !== "/" && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

/**
 * 정적 경로는 ROUTE_CONFIG_MAP 기준.
 * `/products/[productId]` 는 공개(상품 상세).
 */
export function getRouteAccess(pathname: string): RouteAccess | undefined {
  const path = normalizePathname(pathname);
  if (path in ROUTE_CONFIG_MAP) {
    return ROUTE_CONFIG_MAP[path as keyof typeof ROUTE_CONFIG_MAP];
  }
  if (
    path.startsWith(PRODUCT_DETAIL_PREFIX) &&
    path.length > PRODUCT_DETAIL_PREFIX.length
  ) {
    return "public";
  }
  return undefined;
}
