"use client";

import { cn } from "@/components/ui";
import { useLikeToggle } from "@/components/commerce/likes/useLikeToggle";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export type LikeButtonProps = {
  productId: string;
  initialLiked?: boolean;
  className?: string;
};

export function LikeButton({
  productId,
  initialLiked = false,
  className,
}: LikeButtonProps) {
  const { liked, pending, ariaLabel, toggle } = useLikeToggle(
    productId,
    initialLiked,
  );

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "box-border flex h-[52px] min-h-[52px] w-full min-w-0 flex-1 items-center justify-center gap-2 rounded-lg",
        "border border-solid antialiased",
        "transition-[background-color,box-shadow,opacity,transform,color,border-color] duration-200 ease-in-out",
        liked
          ? "border-(--commerce-semantic-danger) bg-(--commerce-background-light) text-(--commerce-semantic-danger)"
          : "border-(--commerce-primary-main) bg-transparent text-(--commerce-text-primary)",
        "hover:bg-(--commerce-background-light) hover:shadow-[inset_0_0_0_1px_rgba(20,23,24,0.04),0_1px_2px_rgba(20,23,24,0.06)]",
        "active:scale-[0.995] active:bg-(--commerce-background-elevated) active:shadow-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        pending && "cursor-wait",
        className,
      )}
      aria-label={ariaLabel}
      aria-pressed={liked}
      onClick={toggle}
    >
      {liked ? (
        <FaHeart className="size-5 shrink-0" aria-hidden />
      ) : (
        <FaRegHeart className="size-5 shrink-0" aria-hidden />
      )}
      <span className="min-w-0 truncate text-center leading-[28px]">
        Wishlist
      </span>
    </button>
  );
}

