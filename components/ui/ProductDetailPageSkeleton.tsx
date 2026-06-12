// 상품 상세 전체가 아직 준비되지 않았을 때 보여줄 페이지 레벨 스켈레톤입니다.
import { ReviewListSkeleton } from "@/components/ui/ReviewListSkeleton";
import { ReviewSummarySkeleton } from "@/components/ui/ReviewSummarySkeleton";

// 상품 상세 진입 직후 메인 레이아웃 윤곽을 먼저 보여 주는 페이지 스켈레톤입니다.
export function ProductDetailPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-8">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <div className="aspect-square w-full animate-pulse rounded-xl bg-(--commerce-background-light)" />

        <div className="flex min-w-0 flex-col gap-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-20 rounded bg-(--commerce-border-subtle)" />
            <div className="h-9 w-4/5 rounded bg-(--commerce-border-subtle)" />
            <div className="h-6 w-40 rounded bg-(--commerce-border-subtle)" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-(--commerce-border-subtle)" />
              <div className="h-4 w-[88%] rounded bg-(--commerce-border-subtle)" />
              <div className="h-4 w-[72%] rounded bg-(--commerce-border-subtle)" />
            </div>
          </div>

          <div className="border-t border-(--commerce-border-subtle) pt-8">
            <div className="flex flex-col gap-4 sm:h-[52px] sm:flex-row sm:items-stretch sm:gap-6">
              <div className="h-[52px] w-[127px] animate-pulse rounded-lg bg-(--commerce-background-light)" />
              <div className="size-[52px] animate-pulse rounded-lg bg-(--commerce-background-light)" />
            </div>
            <div className="mt-4 h-[52px] w-full animate-pulse rounded-lg bg-(--commerce-background-light)" />
          </div>
        </div>
      </div>

      <div className="mt-14 w-full pt-10">
        <div className="border-b border-(--commerce-border-subtle)">
          <div className="flex flex-wrap items-end gap-x-6 sm:gap-x-10 md:gap-x-14">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`detail-tab-skeleton-${idx}`}
                className="h-9 w-28 animate-pulse rounded bg-(--commerce-border-subtle)"
              />
            ))}
          </div>
        </div>

        <div className="space-y-10 pt-12 pb-2">
          <ReviewSummarySkeleton />
          <ReviewListSkeleton />
        </div>
      </div>
    </div>
  );
}
