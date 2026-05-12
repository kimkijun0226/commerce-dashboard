"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FaCcAmex, FaCcMastercard, FaCcVisa } from "react-icons/fa";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";

export type PaymentMethodValue = "toss";

export type PaymentMethodOption = {
  value: PaymentMethodValue;
  label: string;
  helper?: string;
};

export type PaymentMethodDropdownProps = {
  name: string;
  value: PaymentMethodValue;
  onChange: (v: PaymentMethodValue) => void;
  disabled?: boolean;
  className?: string;
};

const OPTIONS: readonly PaymentMethodOption[] = [
  { value: "toss", label: "토스페이먼츠", helper: "카드 결제" },
] as const;

export function PaymentMethodDropdown({
  name,
  value,
  onChange,
  disabled,
  className,
}: PaymentMethodDropdownProps) {
  const id = useId();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => OPTIONS.find((o) => o.value === value) ?? OPTIONS[0],
    [value],
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (btnRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, { capture: true } as never);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      {/* form submit을 위한 hidden input */}
      <input type="hidden" name={name} value={value} />

      <button
        ref={btnRef}
        id={`${id}-btn`}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left",
          "min-h-10",
          "outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--commerce-semantic-info)",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        style={{
          ...typographyToStyle(commerceTypography.body2),
          color: commerceColors.text.primary,
          backgroundColor: commerceColors.background.default,
          borderColor: commerceColors.border.subtle,
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0">
          <span className="block truncate">{selected.label}</span>
          {selected.helper ? (
            <span
              className="mt-0.5 block truncate"
              style={{
                ...typographyToStyle(commerceTypography.caption2),
                color: commerceColors.text.secondary,
              }}
            >
              {selected.helper}
            </span>
          ) : null}
        </span>

        <span className="flex items-center gap-2">
          {/* 오른쪽 카드 아이콘 묶음 */}
          <span className="hidden items-center gap-1.5 sm:inline-flex" aria-hidden>
            <FaCcVisa className="size-5 text-(--commerce-text-secondary)" />
            <FaCcMastercard className="size-5 text-(--commerce-text-secondary)" />
            <FaCcAmex className="size-5 text-(--commerce-text-secondary)" />
          </span>
          <FiChevronDown
            className={cn("size-5 transition-transform", open ? "rotate-180" : "")}
            aria-hidden
          />
        </span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={`${id}-panel`}
          role="listbox"
          aria-labelledby={`${id}-btn`}
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-md border bg-white shadow-lg"
          style={{
            borderColor: commerceColors.border.subtle,
          }}
        >
          {OPTIONS.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-left",
                  "transition-colors",
                  active
                    ? "bg-(--commerce-background-light)"
                    : "hover:bg-(--commerce-background-light)",
                )}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className="min-w-0">
                  <span
                    className="block truncate"
                    style={{
                      ...typographyToStyle(commerceTypography.body2),
                      color: commerceColors.text.primary,
                    }}
                  >
                    {opt.label}
                  </span>
                  {opt.helper ? (
                    <span
                      className="mt-0.5 block truncate"
                      style={{
                        ...typographyToStyle(commerceTypography.caption2),
                        color: commerceColors.text.secondary,
                      }}
                    >
                      {opt.helper}
                    </span>
                  ) : null}
                </span>

                <span className="inline-flex items-center gap-1.5" aria-hidden>
                  <FaCcVisa className="size-5 text-(--commerce-text-secondary)" />
                  <FaCcMastercard className="size-5 text-(--commerce-text-secondary)" />
                  <FaCcAmex className="size-5 text-(--commerce-text-secondary)" />
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

