import { STOREFRONTS, type StoreKey } from "./storefront";

export type CampaignFilter = { category?: string; q?: string };
const TARGETS: Record<StoreKey, readonly CampaignFilter[]> = {
  fashion: [
    { category: "니트" },
    { category: "니트" },
    { category: "자켓" },
    { category: "자켓" },
    { category: "코트" },
    { category: "셔츠" },
    { q: "스웻 팬츠" },
    { category: "코트" },
    { q: "코튼" },
    { category: "자켓" },
  ],
  beauty: [
    { category: "세럼·앰플" },
    {},
    { category: "크림" },
    { category: "선케어" },
    { category: "토너" },
    { category: "클렌징" },
    { category: "립케어" },
    {},
    { q: "보습" },
    { category: "크림" },
  ],
  home: [
    { category: "의자·라운지체어" },
    { category: "테이블·데스크" },
    { category: "의자·라운지체어" },
    { category: "수납장" },
    { category: "의자·라운지체어" },
    { category: "스툴·오토만" },
    {},
    { category: "테이블·데스크" },
    { category: "테이블·데스크" },
    { category: "테이블·데스크" },
  ],
};
export function getCampaignTarget(store: StoreKey, index: number) {
  const filter = TARGETS[store][index] ?? {};
  return { ...filter, href: catalogFilterUrl(store, filter, true) };
}
export function catalogFilterUrl(
  store: StoreKey,
  filter: CampaignFilter,
  anchor = false,
) {
  const params = new URLSearchParams();
  if (filter.category) params.set("category", filter.category);
  if (filter.q?.trim()) params.set("q", filter.q.trim());
  return `${STOREFRONTS[store].path}${params.size ? `?${params}` : ""}${anchor ? "#catalog-products" : ""}`;
}

/** Filtering stays on the mounted page; store navigation belongs to Next.js links. */
export function catalogFilterLocation(current: string, filter: CampaignFilter, anchor = false): string {
  const url = new URL(current);
  url.searchParams.delete("category");
  url.searchParams.delete("q");
  if (filter.category) url.searchParams.set("category", filter.category);
  if (filter.q?.trim()) url.searchParams.set("q", filter.q.trim());
  if (anchor) url.hash = "catalog-products";
  return `${url.pathname}${url.search}${url.hash}`;
}

export const CAMPAIGN_COPY: Record<StoreKey, readonly [string, string][]> = {
  fashion: [
    ["가디건의 계절", "툭 걸치기 좋은 니트와 가디건"],
    ["니트부터 꺼낼 시간", "단독으로도, 레이어드로도 좋은 한 벌"],
    ["오늘은 자켓", "데님 위에 가볍게 완성하는 아우터 룩"],
    ["자켓 하나면 충분", "티셔츠에 더하는 가장 간단한 스타일링"],
    ["길게 입는 멋", "트렌치부터 롱 코트까지, 아우터 모아보기"],
    ["셔츠는 여유 있게", "넉넉한 실루엣으로 입는 데일리 셔츠"],
    ["힘 빼고 입는 날", "스웨트와 와이드 팬츠로 편하게"],
    ["코트 입을 날을 기다렸어", "차분한 컬러로 준비하는 코트 스타일링"],
    ["가볍게, 코튼", "티셔츠와 팬츠로 맞추는 담백한 룩"],
    ["주말에도 자켓", "격식은 덜고, 여유는 더한 캐주얼 룩"],
  ],
  beauty: [
    ["세럼부터 시작해", "매일의 기초 케어에 더할 세럼·앰플"],
    ["기초에 집중할 시간", "토너부터 크림까지, 스킨케어 모아보기"],
    ["크림을 고르는 기준", "내 피부에 맞춰 살펴보는 보습 케어"],
    ["외출 전, 선케어", "매일 챙기는 루틴의 마지막 단계"],
    ["세안 다음, 토너", "스킨케어의 첫 단계를 골라보세요"],
    ["오늘의 스킨케어 순서", "클렌징부터 차근차근, 기초 루틴 살펴보기"],
    ["입술에도 루틴이 필요해", "가까이 두고 쓰는 데일리 립케어"],
    ["매일 쓰는 기초", "화장대에 채워둘 스킨케어 아이템"],
    ["보습 루틴 다시 보기", "세럼과 크림, 나에게 맞는 조합 찾기"],
    ["마지막은 크림", "기초 루틴을 마무리할 크림 모아보기"],
  ],
  home: [
    ["앉고 싶은 의자", "거실 한쪽을 채울 라운지 체어"],
    ["거실의 중심, 테이블", "소파 앞에 놓기 좋은 낮은 테이블"],
    ["의자부터 바꿔볼까", "다이닝 공간을 완성하는 체어 셀렉션"],
    ["잘 보이는 수납", "정리도 인테리어가 되는 수납장"],
    ["거실에 포인트 하나", "분위기를 바꾸는 라운지 체어"],
    ["작지만 쓸모 있는", "빈자리마다 어울리는 스툴 모아보기"],
    ["거실을 다시 꾸민다면", "테이블과 체어로 시작하는 공간 스타일링"],
    ["집중이 잘되는 자리", "나만의 작업 공간을 위한 데스크와 의자"],
    ["소파 옆 작은 테이블", "손 닿는 곳에 두는 사이드 테이블"],
    ["우리 집 다이닝", "함께 둘 테이블과 의자를 골라보세요"],
  ],
};

export type CampaignBanner = CampaignFilter & {
  title: string;
  description: string;
  imageUrl: string;
  enabled: boolean;
};
export function defaultCampaigns(store: StoreKey): CampaignBanner[] {
  return CAMPAIGN_COPY[store].map(([title, description], index) => ({
    title,
    description,
    imageUrl: `/campaigns/editorial/${store}-${index + 1}.webp`,
    enabled: true,
    ...TARGETS[store][index],
  }));
}
