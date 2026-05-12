"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button, cn, typographyToStyle } from "@/components/ui";
import { useEffect, useRef } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger";
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  className?: string;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  confirmVariant = "danger",
  isPending = false,
  onConfirm,
  onClose,
  className,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => confirmRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/40"
        onClick={onClose}
        aria-label="닫기"
      />

      <div
        className={cn(
          "relative w-full max-w-[460px] rounded-2xl border bg-white p-6 shadow-xl",
          className,
        )}
        style={{
          borderColor: commerceColors.border.subtle,
          backgroundColor: commerceColors.background.paper,
          fontFamily: commerceTypography.body2.fontFamily,
        }}
      >
        <div className="flex flex-col gap-2">
          <h3
            className="text-lg leading-7"
            style={{
              ...typographyToStyle(commerceTypography.body1Semi),
              color: commerceColors.text.primary,
            }}
          >
            {title}
          </h3>
          {description ? (
            <p
              className="text-sm leading-6"
              style={{
                ...typographyToStyle(commerceTypography.body2),
                color: commerceColors.text.muted,
              }}
            >
              {description}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={isPending}
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            ref={confirmRef}
            type="button"
            variant={confirmVariant}
            size="md"
            loading={isPending}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

