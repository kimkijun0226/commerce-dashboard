import { commerceColors } from "@/commons/constants/color";
import { cn } from "@/components/ui";

export type RatingStarsProps = {
  value: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
};

const px = { sm: 16, md: 20 } as const;

export function RatingStars({
  value,
  max = 5,
  size = "sm",
  className,
  "aria-label": ariaLabel,
}: RatingStarsProps) {
  const n = Math.min(max, Math.max(0, value));
  const dim = px[size];
  const label =
    ariaLabel ?? `평점 ${n}점 만점 ${max}점 중`;

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={label}
    >
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} filled={i < n} size={dim} />
      ))}
    </span>
  );
}

function StarIcon({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M8 1.5l1.84 3.73 4.12.6-2.98 2.9.7 4.1L8 11.77l-3.68 1.94.7-4.1-2.98-2.9 4.12-.6L8 1.5z"
        fill={
          filled ? commerceColors.neutral.n05_100 : "transparent"
        }
        stroke={commerceColors.neutral.n05_100}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </svg>
  );
}
