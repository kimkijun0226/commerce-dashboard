"use client";

import { cn } from "@/components/ui";

export type LoadingSpinnerSize = "sm" | "md" | "lg";

const sizeToClassName: Record<LoadingSpinnerSize, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-[3px]",
};

export type LoadingSpinnerProps = {
  className?: string;
  size?: LoadingSpinnerSize;
  ariaLabel?: string;
};

export function LoadingSpinner({
  className,
  size = "md",
  ariaLabel = "로딩 중",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn("flex items-center justify-center py-8", className)}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div
        className={cn(
          "animate-spin rounded-full border-(--commerce-border-default) border-t-(--commerce-primary-main)",
          sizeToClassName[size],
        )}
        aria-hidden
      />
    </div>
  );
}

