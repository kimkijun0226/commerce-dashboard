"use client";

import { adminColors } from "@/commons/constants/color";
import { cn } from "../cn/cn";
import type { ButtonHTMLAttributes } from "react";

export type SwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "role" | "type"
> & {
  checked: boolean;
  onCheckedChange?: (next: boolean) => void;
  label?: string;
  labelId?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  label,
  labelId,
  className,
  disabled,
  ...rest
}: SwitchProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      {label ? (
        <span
          id={labelId}
          className="text-sm"
          style={{
            fontFamily: "var(--admin-font-body)",
            color: adminColors.text.primary,
          }}
        >
          {label}
        </span>
      ) : null}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={disabled}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-semantic-info)] disabled:cursor-not-allowed disabled:opacity-50",
        )}
        style={{
          backgroundColor: checked
            ? adminColors.neutral.n800
            : adminColors.neutral.n200,
        }}
        onClick={() => onCheckedChange?.(!checked)}
        {...rest}
      >
        <span
          className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform"
          style={{
            transform: checked ? "translateX(20px)" : "translateX(0)",
          }}
          aria-hidden
        />
      </button>
    </div>
  );
}
