"use client";

import { adminColors } from "@/commons/constants/color";
import { Button, cn } from "@/components/ui";
import type { ReactNode } from "react";

export type AdminFilterBarProps = {
  leftSlot?: ReactNode; // 검색/필터 입력
  rightSlot?: ReactNode; // 추가 액션

  onReset?: () => void;
  onApply?: () => void;

  resetLabel?: string;
  applyLabel?: string;

  disabled?: boolean;
  className?: string;
};

export function AdminFilterBar({
  leftSlot,
  rightSlot,
  onReset,
  onApply,
  resetLabel = "초기화",
  applyLabel = "적용",
  disabled,
  className,
}: AdminFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4",
        className,
      )}
      style={{ borderColor: adminColors.border.default }}
      aria-label="필터"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {leftSlot}
      </div>
      <div className="flex items-center gap-2">
        {rightSlot}
        {onReset ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={onReset}
          >
            {resetLabel}
          </Button>
        ) : null}
        {onApply ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={disabled}
            onClick={onApply}
          >
            {applyLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

