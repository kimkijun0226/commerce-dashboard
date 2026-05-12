"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button, cn, typographyToStyle } from "@/components/ui";

type DaumPostcodeData = {
  address: string;
  zonecode: string;
  buildingName?: string;
  apartment?: "Y" | "N";
};

const DaumPostcode = dynamic(() => import("react-daum-postcode"), { ssr: false });

export type PostcodeSearchDialogProps = {
  open: boolean;
  title?: string;
  onSelect: (result: { address: string; zonecode: string }) => void;
  onClose: () => void;
};

export function PostcodeSearchDialog({
  open,
  title = "주소 검색",
  onSelect,
  onClose,
}: PostcodeSearchDialogProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);
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
        className={cn("relative w-full max-w-[520px] rounded-2xl border bg-white p-4 shadow-xl")}
        style={{
          borderColor: commerceColors.border.subtle,
          backgroundColor: commerceColors.background.paper,
          fontFamily: commerceTypography.body2.fontFamily,
        }}
      >
        <div className="flex items-center justify-between gap-3 px-2 pb-3">
          <h3
            style={{
              ...typographyToStyle(commerceTypography.body1Semi),
              color: commerceColors.text.primary,
            }}
          >
            {title}
          </h3>
          <Button ref={closeRef} variant="secondary" size="sm" onClick={onClose}>
            닫기
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-(--commerce-border-subtle)">
          <DaumPostcode
            onComplete={(data: DaumPostcodeData) => {
              const address = String(data.address ?? "").trim();
              const zonecode = String(data.zonecode ?? "").trim();
              if (!address) return;
              onSelect({ address, zonecode });
              onClose();
            }}
            style={{ width: "100%", height: 420 }}
          />
        </div>
      </div>
    </div>
  );
}

