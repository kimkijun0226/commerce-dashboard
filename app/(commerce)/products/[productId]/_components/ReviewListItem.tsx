"use client";

import { reviewDisplayInitials } from "@/app/(commerce)/products/[productId]/_components/reviewDisplayName";
import { deleteReview } from "@/app/(commerce)/products/[productId]/review-actions";
import { ReviewEditForm } from "@/components/commerce/ReviewEditForm";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { RatingStars } from "@/components/commerce/RatingStars/RatingStars";
import { cn } from "@/components/ui";
import type { Review } from "@/features/products/api/useProductReviews";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";

export type ReviewListItemProps = {
  review: Review;
  productId: string;
  currentUserId?: string | null;
  isSuperAdmin?: boolean;
  /** 삭제·수정 성공 후(쿼리 무효화 다음) — 예: `router.refresh()` */
  onAfterMutate?: () => void;
  className?: string;
  /** 마이페이지 등 — 한 줄에 이름·별점·숫자 점수 밀집 */
  layout?: "default" | "accountCompact";
  /** `accountCompact`일 때 프로필 원형 숨김(PDP 등에서는 기본 표시) */
  hideProfileAvatar?: boolean;
};

function displayNameForReview(review: Review): string {
  const dn = review.users?.display_name?.trim();
  if (dn) return dn;
  const email = review.users?.email?.trim();
  if (email && email.includes("@")) {
    return email.split("@")[0] ?? email;
  }
  const h = review.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pool = ["리뷰어", "구매자", "고객", "회원"];
  return `${pool[h % pool.length]} ${(h % 900) + 100}`;
}

/** 별 UI와 동일하게 0.5 단위로 반올림한 점수 문자열 */
function formatReviewRatingLabel(rating: number): string {
  const stepped = Math.round(rating * 2) / 2;
  return Number.isInteger(stepped) ? String(stepped) : stepped.toFixed(1);
}

function formatReviewRatingOneDecimal(rating: number): string {
  const stepped = Math.round(rating * 2) / 2;
  return stepped.toFixed(1);
}

export function ReviewListItem({
  review,
  productId,
  currentUserId,
  isSuperAdmin,
  onAfterMutate,
  className,
  layout = "default",
  hideProfileAvatar = false,
}: ReviewListItemProps) {
  const name = displayNameForReview(review);
  const profileUrl = review.users?.image_url?.trim() || null;
  const router = useRouter();
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const compact = layout === "accountCompact";
  const showAvatar = !(compact && hideProfileAvatar);
  const initials = showAvatar ? reviewDisplayInitials(name) : "";

  const isOwnReview = useMemo(() => {
    if (!currentUserId) return false;
    return review.user_id === currentUserId;
  }, [currentUserId, review.user_id]);

  const ratingDisplay = compact
    ? formatReviewRatingOneDecimal(review.rating)
    : formatReviewRatingLabel(review.rating);

  const actionBtn = compact ? "size-7" : "size-8";
  const actionIcon = compact ? "size-3.5" : "size-4";

  const reviewActions = isOwnReview ? (
    <div className={cn("flex shrink-0 items-center gap-0.5")} aria-label="리뷰 관리">
      <button
        type="button"
        disabled={pending}
        onClick={() => setIsEditing((v) => !v)}
        aria-label={isEditing ? "수정 닫기" : "리뷰 수정"}
        className={cn(
          actionBtn,
          "inline-flex items-center justify-center rounded-full",
          "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
          "text-[#141718]",
          "transition-[transform,background-color,box-shadow] duration-150",
          "hover:scale-[1.06] hover:bg-[rgba(20,23,24,0.06)] hover:shadow-sm",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
        )}
      >
        {isEditing ? (
          <FiX className={actionIcon} aria-hidden />
        ) : (
          <FiEdit2 className={actionIcon} aria-hidden />
        )}
      </button>

      <button
        type="button"
        disabled={pending}
        aria-label="리뷰 삭제"
        className={cn(
          actionBtn,
          "inline-flex items-center justify-center rounded-full",
          "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
          "text-(--commerce-semantic-danger)",
          "transition-[transform,background-color,box-shadow] duration-150",
          "hover:scale-[1.06] hover:bg-[rgba(180,35,24,0.10)] hover:shadow-sm",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
        )}
        onClick={() => {
          if (pending) return;
          const id = toast.message("리뷰를 삭제할까요?", {
            description: "삭제한 리뷰는 복구할 수 없습니다.",
            duration: 8000,
            action: {
              label: "삭제",
              onClick: () => {
                toast.dismiss(id);
                startTransition(async () => {
                  try {
                    await deleteReview(review.id, productId);
                    await Promise.all([
                      qc.invalidateQueries({
                        queryKey: ["reviews", "page", productId],
                      }),
                      qc.invalidateQueries({
                        queryKey: QUERY_KEYS.reviews.byProduct(productId),
                      }),
                      qc.invalidateQueries({
                        queryKey: QUERY_KEYS.reviews.listByProduct(productId),
                      }),
                    ]);
                    toast.success("리뷰가 삭제되었습니다.");
                    onAfterMutate?.();
                  } catch (err) {
                    const msg =
                      err instanceof Error ? err.message : "리뷰를 삭제하지 못했습니다.";
                    if (msg.startsWith("AUTH_REQUIRED:")) {
                      toast.error("로그인이 필요합니다.");
                      router.push(`/login?next=/products/${encodeURIComponent(productId)}`);
                      return;
                    }
                    if (msg.startsWith("FORBIDDEN:")) {
                      toast.error("본인의 리뷰만 삭제할 수 있습니다.");
                      return;
                    }
                    toast.error(
                      msg.includes(":")
                        ? msg.split(":").slice(1).join(":").trim()
                        : msg,
                    );
                  }
                });
              },
            },
            cancel: {
              label: "취소",
              onClick: () => toast.dismiss(id),
            },
          });
        }}
      >
        <FiTrash2 className={actionIcon} aria-hidden />
      </button>
    </div>
  ) : null;

  const bodyBlock =
    isEditing ? (
      <ReviewEditForm
        reviewId={review.id}
        productId={productId}
        initialRating={review.rating}
        initialContent={review.content ?? ""}
        onCancel={() => setIsEditing(false)}
        onSuccess={onAfterMutate}
      />
    ) : review.content?.trim() ? (
      <p
        className={cn(
          "max-w-[52rem] text-[#353945]",
          compact ? "mt-1.5 text-[13px] leading-snug" : "mt-3 text-sm leading-relaxed",
        )}
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        {review.content}
      </p>
    ) : (
      <p
        className={cn(
          "text-[#99a1af]",
          compact ? "mt-1.5 text-[13px] leading-snug" : "mt-3 text-sm leading-relaxed",
        )}
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        작성된 리뷰 내용이 없습니다.
      </p>
    );

  return (
    <article
      className={cn(
        compact && showAvatar && "flex gap-2.5",
        compact && !showAvatar && "min-w-0",
        !compact && "flex gap-4 sm:gap-5",
        className,
      )}
    >
      {showAvatar ? (
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
            "border border-[#e8ecef] bg-[#f3f5f7]",
            compact ? "size-9 text-xs" : "size-11 text-sm",
            !profileUrl && "font-semibold tracking-tight text-[#6c7275]",
          )}
          style={!profileUrl ? { fontFamily: "var(--commerce-font-body)" } : undefined}
        >
          {profileUrl ? (
            <Image
              src={profileUrl}
              alt={`${name} 프로필`}
              fill
              className="object-cover"
              sizes={compact ? "36px" : "44px"}
              unoptimized={
                profileUrl.startsWith("http://") ||
                profileUrl.startsWith("https://") ||
                profileUrl.startsWith("data:")
              }
            />
          ) : (
            initials
          )}
        </div>
      ) : null}
      <div className={cn("min-w-0", showAvatar && "flex-1", !showAvatar && "w-full")}>
        {compact ? (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0">
                <p
                  className="truncate text-sm font-semibold leading-tight text-[#141718]"
                  style={{ fontFamily: "var(--commerce-font-body)" }}
                >
                  {name}
                </p>
                <div className="flex items-center gap-1">
                  <RatingStars
                    value={review.rating}
                    size="sm"
                    palette="product"
                    aria-label={`평점 ${review.rating}점 만점 5점`}
                  />
                  <span
                    className="text-xs font-semibold tabular-nums text-[#141718]"
                    style={{ fontFamily: "var(--commerce-font-body)" }}
                  >
                    {ratingDisplay}
                  </span>
                </div>
              </div>
            </div>
            {reviewActions}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className="truncate text-[15px] font-semibold leading-snug text-[#141718]"
                  style={{ fontFamily: "var(--commerce-font-body)" }}
                >
                  {name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <RatingStars
                    value={review.rating}
                    size="sm"
                    palette="product"
                    aria-label={`평점 ${review.rating}점 만점 5점`}
                  />
                  <span
                    className="text-sm font-semibold tabular-nums text-[#141718]"
                    style={{ fontFamily: "var(--commerce-font-body)" }}
                  >
                    {ratingDisplay}
                  </span>
                </div>
              </div>
              {reviewActions}
            </div>
          </div>
        )}

        {isSuperAdmin ? (
          <p className={cn("text-xs text-(--commerce-semantic-info)", compact ? "mt-1" : "mt-1.5")}>
            관리자 보기 · user_id {review.user_id}
          </p>
        ) : null}

        {bodyBlock}
      </div>
    </article>
  );
}
