"use client";

import { cn } from "@/components/ui";
import { FaWandMagicSparkles } from "react-icons/fa6";

const MOCK_AI_SUMMARY =
  "Customers frequently praise battery life and GPS accuracy. A few mention notification delays that improved after updates. Overall sentiment is strongly positive for outdoor and fitness use.";

export type ReviewSummaryDisplayProps = {
  className?: string;
};

export function ReviewSummaryDisplay({ className }: ReviewSummaryDisplayProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-(--commerce-border-subtle) bg-(--commerce-background-light) p-4 sm:p-5",
        className,
      )}
      aria-label="AI generated review summary"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--commerce-background-elevated) text-(--commerce-text-primary)"
          aria-hidden
        >
          <FaWandMagicSparkles className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-semibold text-(--commerce-text-primary) sm:text-base"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            AI Review
          </h3>
          <p
            className="mt-2 text-sm leading-relaxed text-(--commerce-text-secondary) sm:text-[15px] sm:leading-6"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {MOCK_AI_SUMMARY}
          </p>
        </div>
      </div>
    </section>
  );
}
