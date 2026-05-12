import Link from "next/link";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { commerceTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import { commerceColors } from "@/commons/constants/color";

export function MyReviewsEmptyState() {
  return (
    <div className="rounded-lg border border-(--commerce-border-subtle) bg-white p-8">
      <h3 style={{ ...typographyToStyle(commerceTypography.body1Semi), color: commerceColors.text.primary }}>
        아직 작성한 상품평이 없어요
      </h3>
      <p className="mt-2 text-sm" style={{ ...typographyToStyle(commerceTypography.body2), color: commerceColors.text.secondary }}>
        구매한 상품의 상품평을 남기면 여기에서 모아볼 수 있어요.
      </p>
      <div className="mt-6">
        <Link
          href={COMMERCE_URLS.PRODUCTS}
          aria-label="상품 목록으로 이동"
          className={cn(
            "inline-flex min-h-[48px] items-center justify-center rounded-lg px-6 py-3",
            "bg-(--commerce-primary-main) text-(--commerce-text-inverse)",
            "hover:opacity-95",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
          )}
          style={typographyToStyle(commerceTypography.buttonS)}
        >
          상품 보러 가기
        </Link>
      </div>
    </div>
  );
}
