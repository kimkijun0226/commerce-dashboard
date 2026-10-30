export type StoreKey = "fashion" | "beauty" | "home";
export const STOREFRONTS = {
  home: { key: "home", path: "/", label: "가구", name: "홈", title: "꿈꾸던 공간을 완성하다.", eyebrow: "RÊVIE LIVING", description: "공간은 단순히 머무는 장소가 아니라, 나의 취향과 감성이 쌓여 나만의 세계가 되는 곳입니다.", search: "의자, 테이블, 펌리빙을 검색해 보세요" },
  fashion: { key: "fashion", path: "/fashion", label: "옷", name: "의류", title: "상상하던 나를 입다.", eyebrow: "RÊVIE FASHION", description: "옷은 단순히 몸을 감싸는 것이 아니라, 내가 되고 싶은 모습을 표현하는 하나의 방식입니다.", search: "상품명이나 브랜드를 검색해 보세요" },
  beauty: { key: "beauty", path: "/beauty", label: "화장품", name: "뷰티", title: "나다운 아름다움을 발견하다.", eyebrow: "RÊVIE BEAUTY", description: "아름다움은 정해진 기준이 아닌, 나를 알아가고 가꾸는 시간 속에서 완성됩니다.", search: "세럼, 크림, 코스알엑스를 검색해 보세요" },
} as const;
export function parseStoreKey(value: unknown): StoreKey {
  return value === "beauty" || value === "home" ? value : "fashion";
}
export function storeFromPath(path: string): StoreKey {
  if (path === "/") return "home";
  if (path === "/beauty" || path.startsWith("/beauty/")) return "beauty";
  if (path === "/home" || path.startsWith("/home/")) return "home";
  return "fashion";
}
export function storeProductUrl(id: string, store: StoreKey = "fashion") {
  return `${store === "fashion" ? "" : store === "home" ? "/home" : STOREFRONTS[store].path}/products/${encodeURIComponent(id)}`;
}
