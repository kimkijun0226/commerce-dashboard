"use client";

import { cn } from "@/components/ui";

export type ProductCardSkeletonProps = {
  className?: string;
};

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <article
      className={cn(
        "relative flex w-full max-w-[262px] flex-col",
        "bg-(--commerce-background-default)",
        className,
      )}
      aria-hidden
    >
      <div className="relative aspect-262/349 w-full overflow-hidden rounded-lg bg-(--commerce-background-light)">
        <div className="absolute top-4 right-4 z-10 size-8 rounded-full bg-(--commerce-background-elevated)" />
      </div>
      <div className="flex flex-col gap-2 pt-4">
        <div className="h-4 w-4/5 rounded bg-(--commerce-background-elevated)" />
        <div className="h-4 w-2/5 rounded bg-(--commerce-background-elevated)" />
        <div className="mt-1 h-4 w-1/2 rounded bg-(--commerce-background-elevated)" />
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
  columnsClassName = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  gapClassName = "gap-6 md:gap-8",
  count = 8,
  ariaLabel = "상품 목록 로딩 중",
}: LoadingSkeletonGridProps) {
  const items = Array.from({ length: count });

  return (
    <div role="status" aria-live="polite" aria-label={ariaLabel} className={className}>
      <ul className={cn("grid animate-pulse", columnsClassName, gapClassName)}>
        {items.map((_, i) => (
          <li key={i}>
            <ProductCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

