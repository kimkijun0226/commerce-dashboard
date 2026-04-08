"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Button, cn, typographyToStyle } from "@/components/ui";
import type { FormEventHandler } from "react";
import { useId } from "react";

export type ReviewFormValues = {
  rating: number;
  body: string;
};

export type ReviewFormProps = {
  initialValues?: Partial<ReviewFormValues>;
  onSubmit?: (values: ReviewFormValues) => void;
  disabled?: boolean;
  className?: string;
};

export function ReviewForm({
  initialValues,
  onSubmit,
  disabled,
  className,
}: ReviewFormProps) {
  const id = useId();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const rating = Math.max(1, Math.min(5, Number(fd.get("rating") ?? 5)));
    const body = String(fd.get("body") ?? "").trim();
    onSubmit?.({ rating, body });
  };

  return (
    <form
      className={cn("flex flex-col gap-3 rounded-2xl border p-4", className)}
      style={{
        backgroundColor: commerceColors.background.paper,
        borderColor: commerceColors.border.subtle,
      }}
      onSubmit={handleSubmit}
      aria-label="리뷰 작성"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor={`${id}-rating`}
          style={{
            ...typographyToStyle(commerceTypography.caption2Semi),
            color: commerceColors.text.secondary,
          }}
        >
          평점 (1~5)
        </label>
        <input
          id={`${id}-rating`}
          name="rating"
          type="number"
          min={1}
          max={5}
          step={1}
          defaultValue={initialValues?.rating ?? 5}
          disabled={disabled}
          className={cn(
            "min-h-10 rounded-md border px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--commerce-semantic-info)] disabled:opacity-60",
          )}
          style={{
            ...typographyToStyle(commerceTypography.body2),
            color: commerceColors.text.primary,
            backgroundColor: commerceColors.background.default,
            borderColor: commerceColors.border.default,
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
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
          defaultValue={initialValues?.body ?? ""}
          disabled={disabled}
          rows={4}
          className={cn(
            "resize-y rounded-md border px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--commerce-semantic-info)] disabled:opacity-60",
          )}
          style={{
            ...typographyToStyle(commerceTypography.body2),
            color: commerceColors.text.primary,
            backgroundColor: commerceColors.background.default,
            borderColor: commerceColors.border.default,
          }}
          placeholder="상품은 어떠셨나요?"
        />
      </div>

      <Button type="submit" size="lg" disabled={disabled}>
        리뷰 등록
      </Button>
    </form>
  );
}

