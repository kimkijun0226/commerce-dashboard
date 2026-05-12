"use client";

import Link from "next/link";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { cn } from "@/components/ui";

export function LikeEmptyState() {
  return (
    <div className="rounded-lg border border-(--commerce-border-subtle) bg-white p-8">
      <h3 className="text-[18px] font-semibold leading-7 text-(--commerce-text-primary)">
        아직 위시리스트가 비어 있어요
      </h3>
      <p className="mt-2 text-(--commerce-text-secondary)">
        마음에 드는 상품을 찜하고 여기에서 한 번에 확인해 보세요.
      </p>
      <div className="mt-6">
        <Link
          href={COMMERCE_URLS.PRODUCTS}
          className={cn(
            "inline-flex min-h-[48px] items-center justify-center rounded-lg px-6 py-3",
            "bg-(--commerce-primary-main) text-(--commerce-text-inverse)",
            "text-[16px] font-medium leading-7 tracking-[-0.4px]",
            "hover:opacity-95",
          )}
        >
          상품 보러 가기
        </Link>
      </div>
    </div>
  );
}

