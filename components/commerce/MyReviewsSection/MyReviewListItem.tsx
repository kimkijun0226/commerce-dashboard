"use client";

import Image from "next/image";
import Link from "next/link";
import { ReviewListItem } from "@/app/(commerce)/products/[productId]/_components/ReviewListItem";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { cn, typographyToStyle } from "@/components/ui";
import { useRouter } from "next/navigation";
import type { MyReviewListModel } from "./types";

function formatReviewDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type MyReviewListItemProps = {
  row: MyReviewListModel;
  currentUserId: string;
};

export function MyReviewListItem({ row, currentUserId }: MyReviewListItemProps) {
  const router = useRouter();
  const { review, productId, product } = row;
  const href = COMMERCE_URLS.PRODUCT_DETAIL(productId);
  const title = product?.name?.trim() || "상품 상세";

  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={href}
          aria-label={`${title} 상품 상세 페이지로 이동`}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-sm transition-colors",
            "hover:opacity-90",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
          )}
        >
          <div className="relative size-8 shrink-0 overflow-hidden rounded bg-(--commerce-background-light)">
            {product?.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="32px"
                unoptimized={
                  product.imageUrl.startsWith("http://") ||
                  product.imageUrl.startsWith("https://") ||
                  product.imageUrl.startsWith("data:")
                }
              />
            ) : null}
          </div>
          <p
            className="min-w-0 truncate text-[13px] font-semibold leading-tight sm:text-sm"
            style={{
              ...typographyToStyle(commerceTypography.body2Semi),
              color: commerceColors.text.primary,
            }}
          >
            {title}
          </p>
        </Link>
        <time
          dateTime={review.created_at}
          className="shrink-0 whitespace-nowrap text-[11px] leading-4 text-(--commerce-text-muted) sm:text-xs"
          style={{ ...typographyToStyle(commerceTypography.caption1), fontFamily: "var(--commerce-font-body)" }}
        >
          {formatReviewDate(review.created_at)}
        </time>
      </div>

      <div className="mt-2 border-t border-(--commerce-border-subtle) pt-2">
        <ReviewListItem
          className="gap-0"
          hideProfileAvatar
          layout="accountCompact"
          review={review}
          productId={productId}
          currentUserId={currentUserId}
          onAfterMutate={() => router.refresh()}
        />
      </div>
    </div>
  );
}
