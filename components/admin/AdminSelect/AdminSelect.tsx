"use client";

import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import type { AdminSelectOption } from "@/components/admin/types";
import { cn, typographyToStyle } from "@/components/ui";
import type { SelectHTMLAttributes } from "react";
import { useId } from "react";

export type AdminSelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "onChange"
> & {
  options: readonly AdminSelectOption[];
  onChange?: (value: string) => void;
  placeholder?: string;
};

export function AdminSelect({
  options,
  onChange,
  placeholder,
  value,
  defaultValue,
  disabled,
  id: idProp,
  className,
  ...rest
}: AdminSelectProps) {
  const genId = useId();
  const id = idProp ?? `${genId}-admin-select`;

  const typo = typographyToStyle(adminTypography.tableCell);

  return (
    <div className={cn("relative", className)}>
      <select
        id={id}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        className={cn(
          "w-full appearance-none rounded-md border bg-white py-2 pr-9 pl-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-semantic-info)] disabled:opacity-60",
        )}
        style={{
          minHeight: 40,
          borderColor: adminColors.border.brandSubtle,
          color: adminColors.text.primary,
          ...typo,
        }}
        onChange={(e) => onChange?.(e.currentTarget.value)}
        aria-label={rest["aria-label"] ?? "필터 선택"}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        aria-hidden
        style={{ color: adminColors.text.secondary }}
      >
        <ChevronDownIcon />
      </span>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

