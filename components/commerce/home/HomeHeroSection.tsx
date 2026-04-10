"use client";

import { cn } from "@/components/ui";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export type HomeHeroSectionProps = {
  className?: string;
};

export function HomeHeroSection({ className }: HomeHeroSectionProps) {
  return (
    <section
      aria-label="홈 배너"
      className={cn(
        "mt-16 overflow-hidden rounded-[12px]",
        "border border-(--commerce-border-subtle) bg-(--commerce-background-default)",
        className,
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* image */}
        <div className="relative min-h-[260px] bg-(--commerce-background-elevated) md:min-h-[532px]">
          <div
            className={cn(
              "absolute inset-0",
              "bg-[radial-gradient(1200px_circle_at_20%_20%,rgba(55,125,255,0.22),transparent_40%),radial-gradient(900px_circle_at_80%_50%,rgba(20,23,24,0.18),transparent_42%)]",
            )}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.15),transparent)]"
            aria-hidden
          />
        </div>

        {/* content */}
        <div className="bg-(--commerce-background-light) px-6 py-10 sm:px-10 md:px-[72px] md:py-[140px]">
          <p
            className="text-[16px] font-bold leading-4 tracking-normal text-(--commerce-semantic-info)"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            SALE UP TO 35% OFF
          </p>

          <h2
            className="mt-4 whitespace-pre-line text-[32px] font-medium leading-[36px] tracking-[-0.4px] text-(--commerce-text-primary) sm:text-[40px] sm:leading-[44px]"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            {"HUNDREDS of \nNew lower prices!"}
          </h2>

          <p
            className="mt-4 text-[18px] leading-8 text-(--commerce-text-primary) sm:text-[20px]"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            It’s more affordable than ever to give every room in your home a stylish
            makeover
          </p>

          <Link
            href="/products"
            className={cn(
              "mt-6 inline-flex items-center gap-2 border-b border-(--commerce-text-primary) pb-1",
              "text-[16px] font-medium leading-7 tracking-[-0.4px] text-(--commerce-text-primary)",
              "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--commerce-semantic-info)",
            )}
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            Shop Now
            <FiArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

