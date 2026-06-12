"use client";

// 상품 상세에서 바로 리뷰를 남길 수 있는 인라인 입력 바입니다.
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { useAuth } from "@/commons/hooks/useAuth";
import { Button, cn, typographyToStyle } from "@/components/ui";
import { createReview } from "@/app/(commerce)/products/[productId]/review-actions";
import { formatReviewActionError } from "@/lib/commerce/reviewActionFormat";
import { useQueryClient } from "@tanstack/react-query";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

const REVIEW_AI_REFRESH_EVENT = "commerce:review-ai-refresh-start";

export type ReviewFeedbackBarProps = {
  productId: string;
  /** 특정 주문에 대한 리뷰 작성 시 주문 ID */
  orderId?: string | null;
  /** 등록 성공 후 (폼 닫기·URL 정리·RSC 갱신 등) */
  onSuccess?: () => void;
  className?: string;
};

// 리뷰 작성 입력과 별점 선택, 제출 직후 캐시 정리까지 한 번에 처리합니다.
export function ReviewFeedbackBar({
  productId,
  orderId,
  onSuccess,
  className,
}: ReviewFeedbackBarProps) {
  const { isLoggedIn, isLoading } = useAuth();
  const qc = useQueryClient();
  const [pending, startTransition] = useTransition();

  const [rating, setRating] = useState(5);
  const [previewRating, setPreviewRating] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const activePointerIdRef = useRef<number | null>(null);

  const effectiveRating = previewRating ?? rating;
  const bodyError = useMemo(() => {
    const len = body.trim().length;
    if (len === 0) return null;
    if (len < 10) return "최소 10자 이상 입력해 주세요.";
    return null;
  }, [body]);

  const canWrite = isLoggedIn;
  const canSubmit = canWrite && body.trim().length >= 10 && !pending;
  const BAR_HEIGHT = 72;
  const TEXTAREA_MIN_HEIGHT = 40;
  const CENTER_TOP = Math.floor((BAR_HEIGHT - TEXTAREA_MIN_HEIGHT) / 2); // 16

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    // autosize (2줄부터는 아래로 확장)
    el.style.height = `${TEXTAREA_MIN_HEIGHT}px`;
    const next = Math.min(Math.max(el.scrollHeight, TEXTAREA_MIN_HEIGHT), 260);
    el.style.height = `${next}px`;
    setExpanded(next > TEXTAREA_MIN_HEIGHT + 1);
  }, [body]);

  const ratingLabel = useMemo(() => {
    const v = Math.round(rating * 2) / 2;
    return `${v.toFixed(1)} / 5.0`;
  }, [rating]);

  const starColor = commerceColors.semantic.warning;

  // 별 아이콘의 왼쪽/오른쪽 절반 클릭을 0.5점 단위 점수로 바꿉니다.
  function ratingFromPointer(star: number, clientX: number, rect: DOMRect) {
    const mid = rect.left + rect.width / 2;
    return clientX < mid ? star - 0.5 : star;
  }

  return (
    <div className={cn("w-full", className)}>
      <form
        className={cn(
          "flex w-full gap-4 rounded-2xl border px-6 shadow-sm sm:gap-6",
          "transition-shadow hover:shadow-md",
          expanded ? "items-start" : "items-center",
        )}
        style={{
          borderColor: commerceColors.border.subtle,
          backgroundColor: commerceColors.background.paper,
          fontFamily: commerceTypography.body2.fontFamily,
          minHeight: 72,
        }}
        onSubmit={(e) => {
        e.preventDefault();
        const content = body.trim();
          if (!isLoggedIn) {
          toast.error("로그인이 필요합니다.");
          return;
        }
        if (content.length < 10) {
          toast.error("리뷰 내용은 최소 10자 이상 입력해 주세요.");
          return;
        }

        startTransition(async () => {
          try {
            await createReview({ productId, rating, content, orderId: orderId ?? undefined });
            await Promise.all([
              qc.invalidateQueries({ queryKey: ["reviews", "page", productId] }),
              qc.invalidateQueries({ queryKey: QUERY_KEYS.reviews.byProduct(productId) }),
              qc.invalidateQueries({ queryKey: QUERY_KEYS.reviews.listByProduct(productId) }),
            ]);
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent(REVIEW_AI_REFRESH_EVENT, {
                  detail: { productId },
                }),
              );
            }
            setBody("");
            setRating(5);
            setPreviewRating(null);
            toast.success("리뷰가 등록되었습니다.");
            onSuccess?.();
          } catch (err) {
            toast.error(formatReviewActionError(err));
          }
        });
      }}
      >
      <div
        className={cn(
          "flex shrink-0 items-center gap-0.5",
          expanded && "pt-[28px]",
          (!isLoggedIn || isLoading) && "pointer-events-none opacity-45",
        )}
        role={isLoggedIn ? "radiogroup" : undefined}
        aria-label={isLoggedIn ? "별점 선택" : undefined}
        onPointerUp={() => {
          activePointerIdRef.current = null;
          setPreviewRating(null);
        }}
        onPointerCancel={() => {
          activePointerIdRef.current = null;
          setPreviewRating(null);
        }}
      >
        {([1, 2, 3, 4, 5] as const).map((star) => {
          const seg =
            effectiveRating >= star
              ? "full"
              : effectiveRating >= star - 0.5
                ? "half"
                : "empty";

          return (
            <button
              key={star}
              type="button"
              disabled={!canWrite || pending}
              className={cn(
                "rounded p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
                isLoggedIn && !pending && "cursor-pointer hover:opacity-90",
              )}
              aria-label={`별점 ${star}점`}
              aria-pressed={rating >= star}
              onPointerDown={(e) => {
                if (!canWrite || pending) return;
                const btn = e.currentTarget as HTMLButtonElement;
                activePointerIdRef.current = e.pointerId;
                btn.setPointerCapture(e.pointerId);
                const rect = btn.getBoundingClientRect();
                const next = ratingFromPointer(star, e.clientX, rect);
                setRating(next);
                setPreviewRating(next);
              }}
              onPointerMove={(e) => {
                const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                // hover preview (no active pointer) + drag preview (active pointer)
                if (activePointerIdRef.current == null) {
                  if (!canWrite || pending) return;
                  setPreviewRating(ratingFromPointer(star, e.clientX, rect));
                  return;
                }
                if (activePointerIdRef.current !== e.pointerId) return;
                setPreviewRating(ratingFromPointer(star, e.clientX, rect));
              }}
              onPointerLeave={() => {
                if (activePointerIdRef.current == null) setPreviewRating(null);
              }}
            >
              {seg === "full" ? (
                <FaStar
                  className="size-4 shrink-0"
                style={{ color: starColor }}
                  aria-hidden
                />
              ) : seg === "half" ? (
                <FaStarHalfAlt
                  className="size-4 shrink-0"
                style={{ color: starColor }}
                  aria-hidden
                />
              ) : (
                <FaRegStar
                  className="size-4 shrink-0"
                  style={{ color: commerceColors.text.secondary }}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
        <span
          className="ml-2 select-none"
          style={{
            ...typographyToStyle(commerceTypography.caption1),
            color: commerceColors.text.secondary,
          }}
          aria-live="polite"
        >
          {ratingLabel}
        </span>
      </div>

      <div
        className={cn(
          "min-w-0 flex-1",
          expanded && `pt-[${CENTER_TOP}px] pb-[${CENTER_TOP}px]`,
        )}
      >
        <label
          className="sr-only"
          htmlFor="review-body"
          style={{
            ...typographyToStyle(commerceTypography.caption2Semi),
            color: commerceColors.text.secondary,
          }}
        >
          리뷰 내용
        </label>
        <textarea
          ref={textareaRef}
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.currentTarget.value)}
          placeholder={
            isLoggedIn
              ? "상품은 어떠셨나요? (최소 10자)"
              : "로그인하시면 리뷰를 남길 수 있어요."
          }
          disabled={!canWrite || pending}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent",
            "text-base leading-[26px]",
            "outline-none placeholder:opacity-100",
            "min-h-[40px] pt-[9px] pb-[5px]",
          )}
          style={{
            fontFamily: commerceTypography.body2.fontFamily,
            color: commerceColors.text.primary,
            caretColor: commerceColors.primary.main,
          }}
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <Button
          type="submit"
          size="md"
          loading={pending}
          disabled={!canSubmit}
          className="min-w-[176px] rounded-full px-8"
          style={expanded ? { marginTop: 16 } : undefined}
        >
          리뷰 작성
        </Button>
      </div>
      </form>
      {bodyError ? (
        <p
          className="mt-2"
          style={{
            ...typographyToStyle(commerceTypography.caption2),
            color: commerceColors.semantic.danger,
            fontFamily: commerceTypography.caption2.fontFamily,
          }}
          role="alert"
        >
          {bodyError}
        </p>
      ) : null}
    </div>
  );
}
