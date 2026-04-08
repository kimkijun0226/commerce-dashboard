"use client";

import { adminColors } from "@/commons/constants/color";
import { cn } from "@/components/ui";
import type { ButtonHTMLAttributes } from "react";

export type AdminToggleSwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "role" | "type" | "onChange"
> & {
  checked: boolean;
  onCheckedChange?: (next: boolean) => void;
};

/** Figma(310:2924) 44×24 pill 스위치 */
export function AdminToggleSwitch({
  checked,
  onCheckedChange,
  className,
  disabled,
  ...rest
}: AdminToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-semantic-info)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{
        backgroundColor: checked
          ? adminColors.neutral.n900
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
  );
}

