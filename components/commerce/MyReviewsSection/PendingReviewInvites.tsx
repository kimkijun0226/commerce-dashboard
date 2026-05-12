import Image from "next/image";
import Link from "next/link";
import type { PendingReviewSlotModel } from "@/app/(commerce)/account/reviews/pending-queries";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { cn, typographyToStyle } from "@/components/ui";

function formatOrderDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

export type PendingReviewInvitesProps = {
  slots: readonly PendingReviewSlotModel[];
  /** `minimal`: 탭 안 등 — 제목·설명 없이 목록만 */
  variant?: "full" | "minimal";
};

export function PendingReviewInvites({ slots, variant = "full" }: PendingReviewInvitesProps) {
  if (slots.length === 0) return null;

  const n = slots.length;
  const minimal = variant === "minimal";

  const list = (
    <ul
      className={cn(
        "divide-y divide-(--commerce-border-subtle) border border-(--commerce-border-subtle) bg-white",
        minimal ? "rounded-md" : "mt-4 rounded-lg",
      )}
    >
      {slots.map((s) => {
        const title = s.productName?.trim() || "상품";
        const href = COMMERCE_URLS.PRODUCT_DETAIL_REVIEW_WRITE(s.productId, s.orderId);
        const dateShort = formatOrderDate(s.orderCreatedAt);
        return (
          <li
            key={`${s.orderId}:${s.productId}`}
            className={cn(
              "flex items-center justify-between gap-2",
              minimal ? "px-2.5 py-2 sm:gap-3 sm:px-3" : "flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="relative size-9 shrink-0 overflow-hidden rounded bg-(--commerce-background-light) sm:size-10">
                {s.productImageUrl ? (
                  <Image
                    src={s.productImageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized={
                      s.productImageUrl.startsWith("http://") ||
                      s.productImageUrl.startsWith("https://") ||
                      s.productImageUrl.startsWith("data:")
                    }
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[13px] font-semibold text-(--commerce-text-primary) sm:text-sm"
                  style={minimal ? undefined : typographyToStyle(commerceTypography.body2Semi)}
                >
                  {title}
                </p>
                <p
                  className="truncate text-[11px] text-(--commerce-text-muted) sm:text-xs"
                  style={{ fontFamily: "var(--commerce-font-body)" }}
                >
                  {minimal ? dateShort : `주문일 ${dateShort}`}
                </p>
              </div>
            </div>
            <Link
              href={href}
              className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-md border border-(--commerce-border-strong) font-semibold text-(--commerce-text-primary) transition-colors hover:bg-(--commerce-background-light)",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
                minimal ? "h-7 px-2.5 text-xs" : "h-8 rounded-full px-3 text-[13px]",
              )}
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              {minimal ? "작성" : "상품평 작성"}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  if (minimal) {
    return (
      <section id="pending-review-invites" className="scroll-mt-24" aria-label={`미작성 상품평 ${n}건`}>
        <div className="mb-2 flex justify-end">
          <Link
            href={ACCOUNT_URLS.ORDERS}
            className="text-[11px] font-medium text-(--commerce-text-muted) underline-offset-2 hover:text-(--commerce-primary-main) hover:underline sm:text-xs"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            주문내역
          </Link>
        </div>
        {list}
      </section>
    );
  }

  return (
    <section
      id="pending-review-invites"
      className="mb-8 scroll-mt-24"
      aria-label={`작성 가능한 상품평 ${n}건`}
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3
          className="text-black"
          style={{
            ...typographyToStyle(commerceTypography.headline7),
            fontFamily: "var(--commerce-font-heading)",
          }}
        >
          작성 가능한 상품평
          <span
            className="ml-2 inline-block rounded-md px-2 py-0.5 text-[15px] font-semibold tabular-nums text-(--commerce-primary-main)"
            style={{ backgroundColor: "rgba(55, 125, 255, 0.12)" }}
          >
            {n}건
          </span>
        </h3>
        <Link
          href={ACCOUNT_URLS.ORDERS}
          className="shrink-0 text-[13px] font-semibold text-(--commerce-text-secondary) underline-offset-2 hover:text-(--commerce-primary-main) hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          주문내역에서 보기 →
        </Link>
      </div>
      <p
        className="mt-1.5 max-w-2xl text-[13px] leading-snug sm:text-sm"
        style={{
          ...typographyToStyle(commerceTypography.body2),
          color: commerceColors.text.secondary,
        }}
      >
        결제 완료된 주문마다 상품평을 남길 수 있어요. 미작성 건은 아래에서 한 번에 선택해 작성하세요.
      </p>
      {list}
    </section>
  );
}
