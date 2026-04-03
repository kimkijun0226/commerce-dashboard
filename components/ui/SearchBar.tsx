"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { FormEventHandler, InputHTMLAttributes } from "react";
import { useId } from "react";

export type SearchBarProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  onSearch?: (query: string) => void;
  submitLabel?: string;
  submitAriaLabel?: string;
};

export function SearchBar({
  className,
  placeholder = "Search for products...",
  value,
  defaultValue,
  onSearch,
  submitLabel = "Search",
  submitAriaLabel,
  id: idProp,
  ...inputRest
}: SearchBarProps) {
  const genId = useId();
  const inputId = idProp ?? `${genId}-search`;

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const q = String(data.get("q") ?? "");
    onSearch?.(q);
  };

  return (
    <form
      role="search"
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3",
        className,
      )}
      style={{
        backgroundColor: commerceColors.background.paper,
        borderColor: commerceColors.border.subtle,
      }}
      onSubmit={handleSubmit}
    >
      <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M11 19a8 8 0 100-16 8 8 0 000 16zm9 2l-4.35-4.35"
          stroke={commerceColors.text.muted}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
      <input
        id={inputId}
        name="q"
        type="search"
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        className="min-w-0 flex-1 bg-transparent focus-visible:outline-none"
        style={{
          ...typographyToStyle(commerceTypography.body2),
          color: commerceColors.text.primary,
        }}
        {...inputRest}
      />
      <Button
        type="submit"
        size="sm"
        shape="pill"
        aria-label={submitAriaLabel ?? submitLabel}
      >
        {submitLabel}
      </Button>
    </form>
  );
}
