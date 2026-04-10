"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button } from "../Button/Button";
import { cn } from "../cn/cn";
import { typographyToStyle } from "../typography-styles/typography-styles";
import type {
  ButtonHTMLAttributes,
  FormEvent,
  InputHTMLAttributes,
} from "react";
import { forwardRef, useId } from "react";
import { FiSearch } from "react-icons/fi";

export type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> & {
  /** 버튼 라벨 (Figma 기본: Search). 없으면 버튼을 숨김 */
  actionLabel?: string;
  onAction?: (value: string) => void;
  actionProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      className,
      placeholder = "Search for products...",
      actionLabel = "Search",
      onAction,
      actionProps,
      value,
      defaultValue,
      onChange,
      disabled,
      id: idProp,
      ...rest
    },
    ref,
  ) {
    const genId = useId();
    const id = idProp ?? `${genId}-search`;
    const typo = typographyToStyle(commerceTypography.body2);

    function submit(e: FormEvent) {
      e.preventDefault();
      const el = document.getElementById(id) as HTMLInputElement | null;
      onAction?.(el?.value ?? "");
    }

    return (
      <form
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border px-6 py-4",
          className,
        )}
        style={{
          backgroundColor: commerceColors.background.paper,
          borderColor: commerceColors.border.subtle,
        }}
        onSubmit={submit}
      >
        <FiSearch
          className="size-6 shrink-0"
          aria-hidden
          style={{ color: commerceColors.text.secondary }}
        />
        <input
          ref={ref}
          id={id}
          type="search"
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          className={cn(
            "min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-60",
          )}
          style={{
            ...typo,
            color: commerceColors.text.primary,
          }}
          placeholder={placeholder}
          {...rest}
        />
        {actionLabel ? (
          <Button
            type="submit"
            size="md"
            disabled={disabled}
            className={cn("rounded-full px-10", actionProps?.className)}
            style={{
              minHeight: 40,
              borderRadius: 80,
              ...actionProps?.style,
            }}
            {...actionProps}
          >
            {actionLabel}
          </Button>
        ) : null}
      </form>
    );
  },
);
