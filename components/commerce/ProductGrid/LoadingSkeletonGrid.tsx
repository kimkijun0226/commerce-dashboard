import { cn } from "@/components/ui";

export type ProductCardSkeletonProps = {
  className?: string;
};

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <article
      className={cn(
        "relative flex w-full flex-col",
        "bg-(--commerce-background-default)",
        className,
      )}
      aria-hidden
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] bg-[#f3f4f5]">
        <div className="absolute right-2 top-2 flex gap-1.5 sm:right-3 sm:top-3">
          <div className="size-8 rounded-[3px] bg-white/80" />
          <div className="size-8 rounded-[3px] bg-white/80" />
        </div>
      </div>
      <div className="flex flex-col pt-3">
        <div className="mb-1 flex h-4 items-center"><div className="h-2.5 w-12 rounded bg-[#e8ebed]" /></div>
        <div className="flex h-5 flex-col justify-center gap-2">
          <div className="h-3 w-4/5 rounded bg-[#e8ebed]" />
        </div>
        <div className="mt-1.5 flex h-7 items-center"><div className="h-4 w-20 rounded bg-[#e1e5e8]" /></div>
        <div className="mt-2 flex h-4 items-center gap-1.5">
          <div className="size-3 rounded-[3px] bg-[#e8ebed]" />
          <div className="h-2.5 w-16 rounded bg-[#e8ebed]" />
        </div>
      </div>
    </article>
  );
}

export type LoadingSkeletonGridProps = {
  className?: string;
  columnsClassName?: string;
  gapClassName?: string;
  count?: number;
  ariaLabel?: string;
};

export function LoadingSkeletonGrid({
  className,
  columnsClassName = "grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6",
  gapClassName = "gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9",
  count = 18,
  ariaLabel = "상품 목록 로딩 중",
}: LoadingSkeletonGridProps) {
  const items = Array.from({ length: count });

  return (
    <div role="status" aria-live="polite" aria-label={ariaLabel} className={className}>
      <ul className={cn("grid motion-safe:animate-pulse", columnsClassName, gapClassName)}>
        {items.map((_, i) => (
          <li key={i}>
            <ProductCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

