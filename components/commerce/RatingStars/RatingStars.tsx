"use client";

import { commerceColors } from "@/commons/constants/color";
import { cn } from "@/components/ui";
import { FaRegStar, FaStar } from "react-icons/fa";

export type RatingStarsProps = {
  value: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
};

const sizeClass = { sm: "size-4", md: "size-5" } as const;

export function RatingStars({
  value,
  max = 5,
  size = "sm",
  className,
  "aria-label": ariaLabel,
}: RatingStarsProps) {
  const n = Math.min(max, Math.max(0, value));
  const label =
    ariaLabel ?? `평점 ${n}점 만점 ${max}점 중`;
  const starColor = commerceColors.neutral.n05_100;

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={label}
    >
      {Array.from({ length: max }, (_, i) =>
        i < n ? (
          <FaStar
            key={i}
            className={cn(sizeClass[size], "shrink-0")}
            style={{ color: starColor }}
            aria-hidden
          />
        ) : (
          <FaRegStar
            key={i}
            className={cn(sizeClass[size], "shrink-0")}
            style={{ color: starColor }}
            aria-hidden
          />
        ),
      )}
    </span>
  );
}
