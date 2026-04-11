"use client";

import { commerceColors } from "@/commons/constants/color";
import { cn } from "@/components/ui";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

export type RatingStarsProps = {
  /** 0~max, 소수 허용 (0.5 단위로 반올림해 별·반별 표시) */
  value: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
};

const sizeClass = { sm: "size-4", md: "size-5" } as const;

type Segment = "full" | "half" | "empty";

/** 0.5 단계로 반올림한 뒤 full / half / empty 5칸 배열 */
function toStarSegments(value: number, max: number): Segment[] {
  const v = Math.min(max, Math.max(0, value));
  const stepped = Math.round(v * 2) / 2;
  const out: Segment[] = [];
  let remaining = stepped;
  for (let i = 0; i < max; i++) {
    if (remaining >= 1) {
      out.push("full");
      remaining -= 1;
    } else if (remaining >= 0.5) {
      out.push("half");
      remaining -= 0.5;
    } else {
      out.push("empty");
    }
  }
  return out;
}

export function RatingStars({
  value,
  max = 5,
  size = "sm",
  className,
  "aria-label": ariaLabel,
}: RatingStarsProps) {
  const clamped = Math.min(max, Math.max(0, value));
  const segments = toStarSegments(clamped, max);
  const label =
    ariaLabel ??
    `평점 ${clamped.toFixed(1)}점, 만점 ${max}점`;
  const starColor = commerceColors.neutral.n05_100;
  const iconCls = cn(sizeClass[size], "shrink-0");

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={label}
    >
      {segments.map((seg, i) => {
        if (seg === "full") {
          return (
            <FaStar
              key={i}
              className={iconCls}
              style={{ color: starColor }}
              aria-hidden
            />
          );
        }
        if (seg === "half") {
          return (
            <FaStarHalfAlt
              key={i}
              className={iconCls}
              style={{ color: starColor }}
              aria-hidden
            />
          );
        }
        return (
          <FaRegStar
            key={i}
            className={iconCls}
            style={{ color: starColor }}
            aria-hidden
          />
        );
      })}
    </span>
  );
}
