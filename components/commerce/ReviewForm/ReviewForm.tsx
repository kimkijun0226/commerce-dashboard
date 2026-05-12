"use client";

import { createReview } from "@/app/(commerce)/products/[productId]/review-actions";
import { formatReviewActionError } from "@/lib/commerce/reviewActionFormat";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { Button, cn, typographyToStyle } from "@/components/ui";
import { useQueryClient } from "@tanstack/react-query";
import type { FormEventHandler } from "react";
import { useId, useMemo, useState, useTransition } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import { toast } from "sonner";

export type ReviewFormProps = {
  productId: string;
  className?: string;
};

function clampRating(n: number) {
  return Math.max(1, Math.min(5, Math.floor(n)));
}

export function ReviewForm({ productId, className }: ReviewFormProps) {
  const id = useId();
  const qc = useQueryClient();
  const [pending, startTransition] = useTransition();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [body, setBody] = useState("");

  const effectiveRating = hoverRating ?? rating;
  const bodyError = useMemo(() => {
    const len = body.trim().length;
    if (len === 0) return null;
    if (len < 10) return "최소 10자 이상 입력해 주세요.";
    return null;
  }, [body]);

  const disabled = pending || (body.trim().length > 0 && body.trim().length < 10);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const content = body.trim();
    if (content.length < 10) {
      toast.error("리뷰 내용은 최소 10자 이상 입력해 주세요.");
      return;
    }

    startTransition(async () => {
      try {
        await createReview({
          productId,
          rating: clampRating(rating),
          content,
        });
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["reviews", "page", productId] }),
          qc.invalidateQueries({ queryKey: QUERY_KEYS.reviews.byProduct(productId) }),
          qc.invalidateQueries({ queryKey: QUERY_KEYS.reviews.listByProduct(productId) }),
        ]);
        setBody("");
        setRating(5);
        setHoverRating(null);
        toast.success("리뷰가 등록되었습니다.");
      } catch (err) {
        toast.error(formatReviewActionError(err));
      }
    });
  };

  return (
    <form
      className={cn(
        "relative z-10 flex flex-col gap-3 rounded-2xl border p-4",
        className,
      )}
      style={{
        backgroundColor: commerceColors.background.paper,
        borderColor: commerceColors.border.subtle,
      }}
      onSubmit={handleSubmit}
      aria-label="리뷰 작성"
    >
      <fieldset className="flex flex-col gap-2">
        <legend
          className="sr-only"
          style={{
            ...typographyToStyle(commerceTypography.caption2Semi),
            color: commerceColors.text.secondary,
          }}
        >
          별점
        </legend>

        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label="별점 선택"
        >
          {([1, 2, 3, 4, 5] as const).map((n) => {
            const active = n <= effectiveRating;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`별점 ${n}점`}
                className={cn(
                  "rounded p-1",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
                  pending && "cursor-not-allowed opacity-70",
                )}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(null)}
                onFocus={() => setHoverRating(n)}
                onBlur={() => setHoverRating(null)}
                onClick={() => setRating(n)}
                disabled={pending}
              >
                {active ? (
                  <FaStar
                    className="size-4"
                    style={{ color: commerceColors.primary.main }}
                    aria-hidden
                  />
                ) : (
                  <FaRegStar
                    className="size-4"
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
            {rating} / 5
          </span>
        </div>

        <label
          htmlFor={`${id}-body`}
          style={{
            ...typographyToStyle(commerceTypography.caption2Semi),
            color: commerceColors.text.secondary,
          }}
        >
          내용
        </label>
        <textarea
          id={`${id}-body`}
          name="body"
          required
          value={body}
          onChange={(e) => setBody(e.currentTarget.value)}
          rows={4}
          className={cn(
            "resize-y rounded-md border px-3 py-2",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--commerce-semantic-info)",
            "disabled:opacity-60",
          )}
          style={{
            ...typographyToStyle(commerceTypography.body2),
            color: commerceColors.text.primary,
            backgroundColor: commerceColors.background.default,
            borderColor: commerceColors.border.default,
          }}
          placeholder="상품은 어떠셨나요? (최소 10자)"
          aria-describedby={bodyError ? `${id}-body-error` : undefined}
          aria-invalid={bodyError ? true : undefined}
          autoFocus
          disabled={pending}
        />
        {bodyError ? (
          <p
            id={`${id}-body-error`}
            style={{
              ...typographyToStyle(commerceTypography.caption2),
              color: commerceColors.semantic.danger,
            }}
            role="alert"
          >
            {bodyError}
          </p>
        ) : null}
      </fieldset>

      <Button type="submit" size="lg" disabled={disabled}>
        {pending ? "등록 중…" : "리뷰 등록"}
      </Button>
    </form>
  );
}

