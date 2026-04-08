"use client";

import { adminColors } from "@/commons/constants/color";
import { cn } from "@/components/ui";
import type { ReactNode } from "react";

export type AdminLayoutProps = {
  headerSlot?: ReactNode;
  sidebarSlot?: ReactNode;
  topbarSlot?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminLayout({
  headerSlot,
  sidebarSlot,
  topbarSlot,
  children,
  className,
}: AdminLayoutProps) {
  return (
    <div
      className={cn("min-h-screen", className)}
      style={{ backgroundColor: adminColors.neutral.n100 }}
    >
      {headerSlot}
      <div className="mx-auto flex max-w-[1440px]">
        {sidebarSlot}
        <main className="min-w-0 flex-1 p-6">
          {topbarSlot ? <div className="mb-6">{topbarSlot}</div> : null}
          {children}
        </main>
      </div>
    </div>
  );
}

