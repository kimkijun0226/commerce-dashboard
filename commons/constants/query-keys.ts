// commons/constants/query-keys.ts
export const QUERY_KEYS = {
  products: {
    all: ["products"] as const,
    list: (filters?: { limit?: number; search?: string }) =>
      ["products", "list", filters] as const,
    detail: (productId: string) => ["products", "detail", productId] as const,
  },
  reviews: {
    /** 상품별 리뷰 목록(평점·개수 계산용) */
    byProduct: (productId: string) => ["reviews", "byProduct", productId] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (filters?: { userId?: string }) =>
      ["orders", "list", filters] as const,
    detail: (orderId: string) => ["orders", "detail", orderId] as const,
  },
} as const;
