"use client";

import { cn } from "@/components/ui";
import Link from "next/link";
import { FaRegStar, FaStar } from "react-icons/fa";
import { FiSmile } from "react-icons/fi";

export type ReviewFeedbackBarProps = {
  isLoggedIn: boolean;
  draftRating: number;
  onDraftRatingChange: (n: number) => void;
  onWriteReviewClick: () => void;
  className?: string;
};

/** Figma Feedback_Form (48:9138): 72px 높이, 16px radius, #fefefe / stroke #e8ecef */
export function ReviewFeedbackBar({
  isLoggedIn,
  draftRating,
  onDraftRatingChange,
  onWriteReviewClick,
  className,
}: ReviewFeedbackBarProps) {
  return (
    <div
      className={cn(
        "flex min-h-[72px] flex-wrap items-center gap-4 rounded-2xl border border-[#e8ecef] bg-[#fefefe] px-6 py-3 sm:gap-6",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-0.5",
          !isLoggedIn && "pointer-events-none opacity-50",
        )}
        role={isLoggedIn ? "group" : undefined}
        aria-label={isLoggedIn ? "Select rating" : undefined}
      >
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            type="button"
            disabled={!isLoggedIn}
            onClick={() => onDraftRatingChange(n)}
            className={cn(
              "rounded p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
              isLoggedIn && "cursor-pointer",
            )}
            aria-pressed={draftRating >= n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            {n <= draftRating ? (
              <FaStar className="size-4 shrink-0 text-[#141718]" aria-hidden />
            ) : (
              <FaRegStar className="size-4 shrink-0 text-[#6c7275]" aria-hidden />
            )}
          </button>
        ))}
      </div>

      <p
        className="min-w-0 flex-1 text-base leading-[26px] text-[#99a1af]"
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        {isLoggedIn ? "Share your thoughts" : "Sign in to share your thoughts"}
      </p>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        {isLoggedIn ? (
          <FiSmile className="size-6 text-[#141718]" aria-hidden />
        ) : null}
        {isLoggedIn ? (
          <button
            type="button"
            onClick={onWriteReviewClick}
            className={cn(
              "inline-flex h-10 min-w-[176px] items-center justify-center rounded-full bg-[#141718] px-8",
              "text-base font-medium leading-7 tracking-[-0.4px] text-white",
              "transition-opacity hover:opacity-90",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
            )}
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            Write Review
          </button>
        ) : (
          <Link
            href="/login"
            className={cn(
              "inline-flex h-10 min-w-[176px] items-center justify-center rounded-full bg-[#141718] px-8",
              "text-base font-medium leading-7 tracking-[-0.4px] text-white",
              "transition-opacity hover:opacity-90",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
            )}
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            Write Review
          </Link>
        )}
      </div>
    </div>
  );
}
