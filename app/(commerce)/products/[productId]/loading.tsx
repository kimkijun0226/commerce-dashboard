import { ProductDetailPageSkeleton } from "@/components/ui";

// 상세 세그먼트 전체가 준비되기 전까지 전용 페이지 스켈레톤을 렌더링합니다.
export default function ProductDetailLoading() {
  // 목록용 loading과 분리해 상세 전용 스켈레톤을 우선 적용합니다.
  return <ProductDetailPageSkeleton />;
}
