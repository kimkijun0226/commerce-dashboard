"use client";

import { cn } from "@/components/ui";
import { useLikeToggle } from "@/components/commerce/likes/useLikeToggle";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export type CardLikeButtonProps = {
  productId: string;
  initialLiked?: boolean;
  /** 배치로 liked를 미리 주입한 경우, 개별 동기화를 건너뜁니다. */
  syncOnMount?: boolean;
  className?: string;
};

export function CardLikeButton({
  productId,
  initialLiked = false,
  syncOnMount = false,
  className,
}: CardLikeButtonProps) {
  const { liked, pending, ariaLabel, toggle } = useLikeToggle(
    productId,
    initialLiked,
    { syncOnMount },
  );

  return (
    <button
      type="button"  
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "flex size-8 items-center justify-center rounded-full",
        "overflow-visible",
        "border border-white/40 bg-white/55 shadow-sm backdrop-blur-md",
        "transition-all hover:bg-white/70 hover:shadow-md",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
   
        className,
      )}
      aria-label={ariaLabel}
      aria-pressed={liked}
      onClick={toggle}
    >
      {liked ? (
        <FaHeart
          className="text-[18px] leading-none text-(--commerce-semantic-danger)"
          aria-hidden
        />
      ) : (
        <FaRegHeart
          className="text-[18px] leading-none text-(--commerce-primary-main)"
          aria-hidden
        />
      )}
    </button>
  );
}

