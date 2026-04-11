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
        "flex min-h-[72px] flex-wrap items-center gap-4 rounded-2xl border border-[#e8ecef] bg-[#fefefe] px-6 py-3 shadow-sm sm:gap-6",
        "transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-0.5",
          !isLoggedIn && "pointer-events-none opacity-45",
        )}
        role={isLoggedIn ? "group" : undefined}
        aria-label={isLoggedIn ? "별점 선택" : undefined}
      >
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            type="button"
            disabled={!isLoggedIn}
            onClick={() => onDraftRatingChange(n)}
            className={cn(
              "rounded p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
              isLoggedIn && "cursor-pointer hover:opacity-80",
            )}
            aria-pressed={draftRating >= n}
            aria-label={`별점 ${n}점`}
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
        {isLoggedIn
          ? "상품은 어떠셨나요? 아래에서 리뷰를 작성해 보세요."
          : "로그인하시면 리뷰를 남길 수 있어요."}
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
              "transition-opacity hover:opacity-90 active:scale-[0.99]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
            )}
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            리뷰 작성
          </button>
        ) : (
          <Link
            href="/login"
            className={cn(
              "inline-flex h-10 min-w-[176px] items-center justify-center rounded-full bg-[#141718] px-8",
              "text-base font-medium leading-7 tracking-[-0.4px] text-white",
              "transition-opacity hover:opacity-90 active:scale-[0.99]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
            )}
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
