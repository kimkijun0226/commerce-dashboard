export type StoreKey = "fashion" | "beauty" | "home";
export const STOREFRONTS = {
  fashion: { key: "fashion", path: "/", label: "옷", name: "의류", title: "입는 취향을 발견하다", eyebrow: "OVEON WARDROBE", description: "오늘의 나를 표현하는 옷. 매일 손이 가는 취향을 만나보세요.", search: "상품명이나 브랜드를 검색해 보세요" },
  beauty: { key: "beauty", path: "/beauty", label: "화장품", name: "뷰티", title: "나를 돌보는 작은 순간", eyebrow: "OVEON BEAUTY", description: "나를 위한 작은 루틴. 피부에 닿는 일상에도 취향을 더해보세요.", search: "세럼, 크림, 코스알엑스를 검색해 보세요" },
  home: { key: "home", path: "/home", label: "가구", name: "홈", title: "머무는 공간에 나다운 온기", eyebrow: "OVEON HOME", description: "의자 하나, 테이블 하나에서 시작되는 나만의 공간.", search: "의자, 테이블, 펌리빙을 검색해 보세요" },
} as const;
export function parseStoreKey(value: unknown): StoreKey {
  return value === "beauty" || value === "home" ? value : "fashion";
}
export function storeFromPath(path: string): StoreKey {
  if (path === "/beauty" || path.startsWith("/beauty/")) return "beauty";
  if (path === "/home" || path.startsWith("/home/")) return "home";
  return "fashion";
}
export function storeProductUrl(id: string, store: StoreKey = "fashion") {
  return `${store === "fashion" ? "" : STOREFRONTS[store].path}/products/${encodeURIComponent(id)}`;
}
