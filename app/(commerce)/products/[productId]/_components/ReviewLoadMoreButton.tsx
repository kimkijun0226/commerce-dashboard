"use client";

import { cn } from "@/components/ui";

export type ReviewLoadMoreButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
};

export function ReviewLoadMoreButton({
  onClick,
  disabled,
  isLoading,
  className,
}: ReviewLoadMoreButtonProps) {
  return (
    <div className={cn("flex justify-center pt-4", className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex h-10 min-w-[158px] items-center justify-center rounded-full border border-[#141718] bg-transparent px-8",
          "text-base font-medium leading-7 tracking-[-0.4px] text-[#141718]",
          "transition-colors hover:bg-[#141718]/5 active:bg-[#141718]/10",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
          (disabled || isLoading) && "cursor-not-allowed opacity-60",
        )}
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        {isLoading ? "불러오는 중…" : "더 보기"}
      </button>
    </div>
  );
}
