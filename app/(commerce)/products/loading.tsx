import { CommerceCatalogPageShell } from "@/components/commerce/catalog/CommerceCatalogPageShell";

// 상품 목록 세그먼트가 로드되기 전 카드 그리드 형태를 먼저 보여 줍니다.
export default function ProductsLoading() {
  return (
    <CommerceCatalogPageShell title="Products">
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <li key={`product-loading-${idx}`}>
            <div className="animate-pulse">
              <div className="aspect-[262/349] w-full rounded bg-(--commerce-background-light)" />
              <div className="pt-4">
                <div className="h-3 w-20 rounded bg-(--commerce-border-subtle)" />
                <div className="mt-3 h-4 w-3/4 rounded bg-(--commerce-border-subtle)" />
                <div className="mt-2 h-4 w-1/2 rounded bg-(--commerce-border-subtle)" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </CommerceCatalogPageShell>
  );
}
