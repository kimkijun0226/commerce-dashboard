"use client";

import { updateReview } from "@/app/(commerce)/products/[productId]/review-actions";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { Button, cn, typographyToStyle } from "@/components/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

export type ReviewEditFormProps = {
  reviewId: string;
  productId: string;
  initialRating: number;
  initialContent: string;
  onCancel: () => void;
  /** 수정 반영 후(캐시 무효화 이후) 호출 — 마이페이지 리뷰 목록 등 */
  onSuccess?: () => void;
  className?: string;
};

type ErrorCode = "AUTH_REQUIRED" | "NOT_FOUND" | "FORBIDDEN" | "VALIDATION";

function parseActionError(err: unknown): { code?: ErrorCode; message: string } {
  if (!(err instanceof Error)) return { message: "요청을 처리하지 못했습니다." };
  const raw = err.message ?? "요청을 처리하지 못했습니다.";
  const idx = raw.indexOf(":");
  if (idx <= 0) return { message: raw };
  const maybeCode = raw.slice(0, idx) as ErrorCode;
  const msg = raw.slice(idx + 1).trim() || raw;
  if (
    maybeCode === "AUTH_REQUIRED" ||
    maybeCode === "NOT_FOUND" ||
    maybeCode === "FORBIDDEN" ||
    maybeCode === "VALIDATION"
  ) {
    return { code: maybeCode, message: msg };
  }
  return { message: raw };
}

function normalizeRating(value: number) {
  const stepped = Math.round(Number(value) * 2) / 2;
  return Math.max(1, Math.min(5, stepped));
}

export function ReviewEditForm({
  reviewId,
  productId,
  initialRating,
  initialContent,
  onCancel,
  onSuccess,
  className,
}: ReviewEditFormProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const [pending, startTransition] = useTransition();

  const [rating, setRating] = useState(() => normalizeRating(initialRating));
  const [previewRating, setPreviewRating] = useState<number | null>(null);
  const [body, setBody] = useState(() => String(initialContent ?? ""));
  const activePointerIdRef = useRef<number | null>(null);

  const effectiveRating = previewRating ?? rating;
  const bodyError = useMemo(() => {
    const len = body.trim().length;
    if (len === 0) return null;
    if (len < 10) return "최소 10자 이상 입력해 주세요.";
    return null;
  }, [body]);

  const canSubmit = body.trim().length >= 10 && !pending;

  function ratingFromPointer(star: number, clientX: number, rect: DOMRect) {
    const mid = rect.left + rect.width / 2;
    return clientX < mid ? star - 0.5 : star;
  }

  return (
    <form
      className={cn(
        "mt-4 rounded-2xl border px-5 py-4",
        "bg-[var(--commerce-background-paper)]",
        className,
      )}
      style={{ borderColor: commerceColors.border.subtle }}
      onSubmit={(e) => {
        e.preventDefault();
        const content = body.trim();
        if (content.length < 10) {
          toast.error("리뷰 내용은 최소 10자 이상 입력해 주세요.");
          return;
        }

        startTransition(async () => {
          try {
            await updateReview(reviewId, productId, rating, content);
            await Promise.all([
              qc.invalidateQueries({ queryKey: ["reviews", "page", productId] }),
              qc.invalidateQueries({ queryKey: QUERY_KEYS.reviews.byProduct(productId) }),
              qc.invalidateQueries({ queryKey: QUERY_KEYS.reviews.listByProduct(productId) }),
            ]);
            toast.success("리뷰가 수정되었습니다.");
            onSuccess?.();
            onCancel();
          } catch (err) {
            const parsed = parseActionError(err);
            if (parsed.code === "AUTH_REQUIRED") {
              toast.error("로그인이 필요합니다.");
              router.push(`/login?next=/products/${encodeURIComponent(productId)}`);
              return;
            }
            if (parsed.code === "FORBIDDEN") {
              toast.error("본인의 리뷰만 수정할 수 있습니다.");
              return;
            }
            toast.error(parsed.message);
          }
        });
      }}
      aria-label="리뷰 수정"
    >
      <div className="flex flex-col gap-3">
        <div
          className={cn("flex items-center gap-1", pending && "opacity-60")}
          role="radiogroup"
          aria-label="별점 수정"
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
                disabled={pending}
                className={cn(
                  "rounded p-1",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
                )}
                aria-label={`별점 ${star}점`}
                onPointerDown={(e) => {
                  if (pending) return;
                  const btn = e.currentTarget as HTMLButtonElement;
                  activePointerIdRef.current = e.pointerId;
                  btn.setPointerCapture(e.pointerId);
                  const rect = btn.getBoundingClientRect();
                  const next = ratingFromPointer(star, e.clientX, rect);
                  setRating(next);
                  setPreviewRating(next);
                }}
                onPointerMove={(e) => {
                  if (pending) return;
                  const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                  if (activePointerIdRef.current == null) {
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
                    className="size-5"
                    style={{ color: commerceColors.semantic.warning }}
                    aria-hidden
                  />
                ) : seg === "half" ? (
                  <FaStarHalfAlt
                    className="size-5"
                    style={{ color: commerceColors.semantic.warning }}
                    aria-hidden
                  />
                ) : (
                  <FaRegStar
                    className="size-5"
                    style={{ color: commerceColors.text.secondary }}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}

          <span
            className="ml-2"
            style={{
              ...typographyToStyle(commerceTypography.caption1),
              color: commerceColors.text.secondary,
            }}
            aria-live="polite"
          >
            {(Math.round(rating * 2) / 2).toFixed(1)} / 5.0
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={`review-edit-${reviewId}`}
            style={{
              ...typographyToStyle(commerceTypography.caption2Semi),
              color: commerceColors.text.secondary,
            }}
          >
            내용
          </label>
          <textarea
            id={`review-edit-${reviewId}`}
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            rows={3}
            className={cn(
              "resize-y rounded-xl border px-4 py-3",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--commerce-semantic-info)",
              "disabled:opacity-60",
            )}
            style={{
              ...typographyToStyle(commerceTypography.body2),
              color: commerceColors.text.primary,
              backgroundColor: commerceColors.background.default,
              borderColor: commerceColors.border.default,
            }}
            placeholder="리뷰를 수정해 주세요. (최소 10자)"
            aria-describedby={bodyError ? `review-edit-${reviewId}-err` : undefined}
            aria-invalid={bodyError ? true : undefined}
            disabled={pending}
          />
          {bodyError ? (
            <p
              id={`review-edit-${reviewId}-err`}
              style={{
                ...typographyToStyle(commerceTypography.caption2),
                color: commerceColors.semantic.danger,
              }}
              role="alert"
            >
              {bodyError}
            </p>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="submit" size="md" loading={pending} disabled={!canSubmit}>
            저장
          </Button>
          <Button
            type="button"
            size="md"
            variant="secondary"
            disabled={pending}
            onClick={onCancel}
          >
            취소
          </Button>
        </div>
      </div>
    </form>
  );
}

