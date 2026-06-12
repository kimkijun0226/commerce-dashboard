"use client";

import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { Button, cn, typographyToStyle } from "@/components/ui";
import type { ReactNode } from "react";

export type AdminHeaderProps = {
  brand?: ReactNode;
  userSlot?: ReactNode;
  onLogout?: () => void;
  className?: string;
};

export function AdminHeader({
  brand = "Commerce Dashboard",
  userSlot,
  onLogout,
  className,
}: AdminHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b bg-white px-6 py-4",
        className,
      )}
      style={{ borderColor: adminColors.border.default }}
      aria-label="관리자 헤더"
    >
      <div
        style={{
          ...typographyToStyle(adminTypography.cardTitle),
          color: adminColors.text.primary,
        }}
      >
        {brand}
      </div>
      <div className="flex items-center gap-3">
        {userSlot}
        {onLogout ? (
          <Button type="button" variant="secondary" size="sm" onClick={onLogout}>
            로그아웃
          </Button>
        ) : null}
      </div>
    </div>
  );
}

