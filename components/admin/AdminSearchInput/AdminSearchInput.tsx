"use client";

import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { FormEventHandler, InputHTMLAttributes } from "react";
import { useId } from "react";

export type AdminSearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "onChange"
> & {
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  name?: string;
  containerClassName?: string;
};

export function AdminSearchInput({
  value,
  defaultValue,
  onChange,
  onSubmit,
  placeholder = "Search by order id",
  name = "q",
  disabled,
  id: idProp,
  className,
  containerClassName,
  ...rest
}: AdminSearchInputProps) {
  const genId = useId();
  const id = idProp ?? `${genId}-admin-search`;

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit?.(String(fd.get(name) ?? ""));
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-white px-3",
        containerClassName,
      )}
      style={{
        minHeight: 40,
        borderColor: adminColors.border.default,
      }}
    >
      <input
        id={id}
        name={name}
        type="search"
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "min-w-0 flex-1 bg-transparent py-2 focus-visible:outline-none disabled:opacity-60",
          className,
        )}
        style={{
          ...typographyToStyle(adminTypography.tableCell),
          color: adminColors.text.primary,
        }}
        onChange={(e) => onChange?.(e.currentTarget.value)}
        {...rest}
      />
      <SearchIcon />
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className="shrink-0"
      style={{ color: adminColors.text.secondary }}
    >
      <path
        d="M8.25 14.25a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm6 1.5-3.262-3.262"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

