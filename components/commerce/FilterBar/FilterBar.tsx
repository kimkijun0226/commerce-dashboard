"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button, cn, Select, type SelectOption, typographyToStyle } from "@/components/ui";
import type { ReactNode } from "react";

export type FilterBarProps = {
  /** 좌측 필터 영역(카테고리/가격대 등)을 슬롯으로 주입 */
  leftSlot?: ReactNode;
  /** 우측 액션 영역(뷰 토글 등)을 슬롯으로 주입 */
  rightSlot?: ReactNode;

  sortOptions?: readonly SelectOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;

  appliedCount?: number;
  onClearAll?: () => void;

  className?: string;
};

export function FilterBar({
  leftSlot,
  rightSlot,
  sortOptions,
  sortValue,
  onSortChange,
  appliedCount = 0,
  onClearAll,
  className,
}: FilterBarProps) {
  const hasClear = appliedCount > 0 && Boolean(onClearAll);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3",
        className,
      )}
      style={{
        backgroundColor: commerceColors.background.paper,
        borderColor: commerceColors.border.subtle,
      }}
      aria-label="상품 필터"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {leftSlot}
        {hasClear ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 px-2"
            onClick={onClearAll}
          >
            <span
              style={{
                ...typographyToStyle(commerceTypography.caption2Semi),
                color: commerceColors.text.secondary,
              }}
            >
              초기화{appliedCount ? ` (${appliedCount})` : ""}
            </span>
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {sortOptions && sortOptions.length > 0 ? (
          <div className="min-w-[180px]">
            <Select
              aria-label="정렬"
              options={sortOptions}
              value={sortValue}
              onChange={(e) => onSortChange?.(e.currentTarget.value)}
            />
          </div>
        ) : null}
        {rightSlot}
      </div>
    </div>
  );
}

