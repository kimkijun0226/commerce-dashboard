"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiMapPin } from "react-icons/fi";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";

export type UserAddress = {
  id: string;
  label: string | null;
  recipientName: string;
  recipientPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  memo: string | null;
  isDefault: boolean;
};

export type AddressDropdownValue = { mode: "saved"; addressId: string } | { mode: "new" };

export type AddressDropdownProps = {
  name: string;
  addresses: readonly UserAddress[];
  value: AddressDropdownValue;
  onChange: (v: AddressDropdownValue) => void;
  disabled?: boolean;
  className?: string;
};

export function AddressDropdown({
  name,
  addresses,
  value,
  onChange,
  disabled,
  className,
}: AddressDropdownProps) {
  const id = useId();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    if (value.mode === "new") return null;
    return addresses.find((a) => a.id === value.addressId) ?? null;
  }, [addresses, value]);

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
      <input
        type="hidden"
        name={name}
        value={value.mode === "saved" ? value.addressId : ""}
      />

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
          {selected ? (
            <>
              <span className="block truncate">
                {selected.label?.trim() || "배송지"}{" "}
                {selected.isDefault ? "(Default)" : ""}
              </span>
              <span
                className="mt-0.5 block truncate"
                style={{
                  ...typographyToStyle(commerceTypography.caption2),
                  color: commerceColors.text.secondary,
                }}
              >
                {selected.addressLine1}
                {selected.addressLine2 ? `, ${selected.addressLine2}` : ""}
              </span>
            </>
          ) : (
            <span className="block truncate">새 주소 입력</span>
          )}
        </span>

        <span className="flex items-center gap-2">
          <FiMapPin className="size-5 text-(--commerce-text-secondary)" aria-hidden />
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
          style={{ borderColor: commerceColors.border.subtle }}
        >
          <button
            type="button"
            role="option"
            aria-selected={value.mode === "new"}
            className={cn(
              "flex w-full items-center justify-between gap-3 px-3 py-2 text-left",
              "transition-colors",
              value.mode === "new"
                ? "bg-(--commerce-background-light)"
                : "hover:bg-(--commerce-background-light)",
            )}
            onClick={() => {
              onChange({ mode: "new" });
              setOpen(false);
            }}
          >
            <span
              style={{
                ...typographyToStyle(commerceTypography.body2),
                color: commerceColors.text.primary,
              }}
            >
              새 주소 입력
            </span>
          </button>

          <div className="h-px w-full bg-(--commerce-border-subtle)" aria-hidden />

          {addresses.map((a) => {
            const active = value.mode === "saved" && value.addressId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                role="option"
                aria-selected={active}
                className={cn(
                  "flex w-full items-start justify-between gap-3 px-3 py-2 text-left",
                  "transition-colors",
                  active
                    ? "bg-(--commerce-background-light)"
                    : "hover:bg-(--commerce-background-light)",
                )}
                onClick={() => {
                  onChange({ mode: "saved", addressId: a.id });
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
                    {a.label?.trim() || "배송지"} {a.isDefault ? "(Default)" : ""}
                  </span>
                  <span
                    className="mt-0.5 block truncate"
                    style={{
                      ...typographyToStyle(commerceTypography.caption2),
                      color: commerceColors.text.secondary,
                    }}
                  >
                    {a.addressLine1}
                    {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

