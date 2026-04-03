"use client";

import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import { RatingStars } from "../RatingStars/RatingStars";
import Image from "next/image";
import { useState } from "react";

export type ReviewCardProps = {
  authorName: string;
  avatarUrl?: string;
  rating: number;
  body: string;
  date?: string;
  className?: string;
};

export function ReviewCard({
  authorName,
  avatarUrl,
  rating,
  body,
  date,
  className,
}: ReviewCardProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  return (
    <article
      className={cn(
        "border-b border-[var(--commerce-border-subtle)] py-6 last:border-b-0",
        className,
      )}
    >
      <div className="flex gap-4">
        <div
          className="relative size-[72px] shrink-0 overflow-hidden rounded-full bg-[var(--commerce-background-light)]"
          aria-hidden={!avatarUrl || avatarFailed}
        >
          {avatarUrl && !avatarFailed ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              unoptimized={
                avatarUrl.startsWith("http://") ||
                avatarUrl.startsWith("https://")
              }
              className="object-cover"
              sizes="72px"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <span
              className="flex size-full items-center justify-center text-lg font-semibold text-[var(--commerce-text-secondary)]"
              aria-hidden
            >
              {authorName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <h3
              style={{
                ...typographyToStyle(commerceTypography.body1Semi),
                color: commerceColors.text.primary,
              }}
            >
              {authorName}
            </h3>
            <RatingStars value={rating} size="sm" />
          </div>
          {date ? (
            <time
              className="mt-1 block text-xs text-[var(--commerce-text-muted)]"
              dateTime={date}
            >
              {date}
            </time>
          ) : null}
          <p
            className="mt-3"
            style={{
              ...typographyToStyle(commerceTypography.body2),
              color: commerceColors.primary.light,
            }}
          >
            {body}
          </p>
        </div>
      </div>
    </article>
  );
}
