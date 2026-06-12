// 리뷰 카드 목록이 들어올 자리를 먼저 보여 주는 리스트용 스켈레톤입니다.
// 실제 리뷰 카드와 비슷한 줄 수와 간격을 맞춰 초기 깜빡임을 줄입니다.
export function ReviewListSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse" aria-hidden>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={`review-skeleton-${idx}`}
          className="flex gap-4 border-b border-(--commerce-border-subtle) py-10 first:pt-2"
        >
          <div className="size-11 shrink-0 rounded-full bg-(--commerce-border-subtle)" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="h-4 w-32 rounded bg-(--commerce-border-subtle)" />
                <div className="mt-2 h-4 w-24 rounded bg-(--commerce-border-subtle)" />
              </div>
              <div className="h-8 w-16 rounded-full bg-(--commerce-border-subtle)" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full rounded bg-(--commerce-border-subtle)" />
              <div className="h-4 w-[84%] rounded bg-(--commerce-border-subtle)" />
              <div className="h-4 w-[66%] rounded bg-(--commerce-border-subtle)" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
