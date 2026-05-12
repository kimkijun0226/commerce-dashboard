"use client";

import { ACCOUNT_URLS } from "@/commons/constants/url";
import { AccountPagination } from "@/components/account/AccountPagination";
import { cn } from "@/components/ui";
import { MyReviewListItem } from "./MyReviewListItem";
import { MyReviewsEmptyState } from "./MyReviewsEmptyState";
import { PendingReviewInvites } from "./PendingReviewInvites";
import type { MyReviewListModel } from "./types";
import type { PendingReviewSlotModel } from "@/app/(commerce)/account/reviews/pending-queries";
import { useEffect, useState } from "react";

export type MyReviewsSectionProps = {
  pendingSlots: readonly PendingReviewSlotModel[];
  reviews: readonly MyReviewListModel[];
  /** DB 전체 작성 건수(탭 배지·페이지네이션과 일치) */
  totalWrittenCount: number;
  totalPages: number;
  currentPage: number;
  currentUserId: string;
};

type TabKey = "pending" | "written";

export function MyReviewsSection({
  pendingSlots,
  reviews,
  totalWrittenCount,
  totalPages,
  currentPage,
  currentUserId,
}: MyReviewsSectionProps) {
  const showEmpty = totalWrittenCount === 0 && pendingSlots.length === 0;

  const [tab, setTab] = useState<TabKey>(() =>
    pendingSlots.length > 0 ? "pending" : "written",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#pending-review-invites") {
      setTab("pending");
    }
  }, []);

  if (showEmpty) {
    return (
      <div className="min-w-0">
        <MyReviewsEmptyState />
      </div>
    );
  }

  const pendingCount = pendingSlots.length;

  return (
    <div className="min-w-0">
      <div
        className="flex gap-0 border-b border-(--commerce-border-subtle)"
        role="tablist"
        aria-label="상품평 관리"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "pending"}
          className={cn(
            "relative px-3 py-2.5 text-[13px] font-semibold transition-colors sm:px-4 sm:text-sm",
            tab === "pending"
              ? "text-(--commerce-text-primary)"
              : "text-(--commerce-text-muted) hover:text-(--commerce-text-secondary)",
          )}
          style={{ fontFamily: "var(--commerce-font-body)" }}
          onClick={() => setTab("pending")}
        >
          미작성 상품평
          <span className="ml-1 tabular-nums text-(--commerce-primary-main)">{pendingCount}</span>
          {tab === "pending" ? (
            <span
              className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-(--commerce-primary-main)"
              aria-hidden
            />
          ) : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "written"}
          className={cn(
            "relative px-3 py-2.5 text-[13px] font-semibold transition-colors sm:px-4 sm:text-sm",
            tab === "written"
              ? "text-(--commerce-text-primary)"
              : "text-(--commerce-text-muted) hover:text-(--commerce-text-secondary)",
          )}
          style={{ fontFamily: "var(--commerce-font-body)" }}
          onClick={() => setTab("written")}
        >
          내 상품평
          <span className="ml-1 tabular-nums text-(--commerce-text-muted)">{totalWrittenCount}</span>
          {tab === "written" ? (
            <span
              className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-(--commerce-primary-main)"
              aria-hidden
            />
          ) : null}
        </button>
      </div>

      <div className="mt-4" role="tabpanel">
        {tab === "pending" ? (
          pendingCount > 0 ? (
            <PendingReviewInvites slots={pendingSlots} variant="minimal" />
          ) : (
            <p
              className="rounded-md border border-(--commerce-border-subtle) bg-white px-4 py-6 text-center text-sm text-(--commerce-text-muted)"
              style={{ fontFamily: "var(--commerce-font-body)" }}
            >
              미작성 상품평이 없습니다.
            </p>
          )
        ) : reviews.length > 0 ? (
          <>
            <ul
              className="divide-y divide-(--commerce-border-subtle) rounded-md border border-(--commerce-border-subtle) bg-white"
              aria-label="작성한 상품평 목록"
            >
              {reviews.map((row) => (
                <li key={row.review.id} className="px-3 py-0 sm:px-4">
                  <MyReviewListItem row={row} currentUserId={currentUserId} />
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <AccountPagination
                page={currentPage}
                totalPages={totalPages}
                basePath={ACCOUNT_URLS.REVIEWS}
              />
            </div>
          </>
        ) : (
          <p
            className="rounded-md border border-(--commerce-border-subtle) bg-white px-4 py-6 text-center text-sm text-(--commerce-text-muted)"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            아직 작성한 상품평이 없습니다. 미작성 상품평 탭에서 작성할 상품을 선택해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}
