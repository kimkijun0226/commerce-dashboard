// 리뷰 요약 블록이 로드되기 전, 실제 레이아웃과 비슷한 형태로 자리만 먼저 잡아 둡니다.
// 요약 박스의 본문과 태그 영역 크기를 먼저 확보해 레이아웃 점프를 줄입니다.
export function ReviewSummarySkeleton() {
  return (
    <section
      className="rounded-lg border border-(--commerce-border-subtle) bg-(--commerce-background-light)/80 p-6 shadow-sm animate-pulse"
      aria-label="AI 리뷰 요약 로딩"
      aria-hidden
    >
      <div className="flex gap-4">
        <div className="size-12 shrink-0 rounded-full bg-(--commerce-border-subtle)" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="h-5 w-28 rounded bg-(--commerce-border-subtle)" />
            <div className="h-8 w-28 rounded-full bg-(--commerce-border-subtle)" />
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-(--commerce-border-subtle)" />
            <div className="h-4 w-[88%] rounded bg-(--commerce-border-subtle)" />
            <div className="h-4 w-[72%] rounded bg-(--commerce-border-subtle)" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <div className="h-7 w-16 rounded-full bg-(--commerce-border-subtle)" />
            <div className="h-7 w-20 rounded-full bg-(--commerce-border-subtle)" />
            <div className="h-7 w-[4.5rem] rounded-full bg-(--commerce-border-subtle)" />
          </div>
        </div>
      </div>
    </section>
  );
}
