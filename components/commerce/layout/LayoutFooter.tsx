"use client";

import { cn } from "@/components/ui";
import Link from "next/link";
import { FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";

export type LayoutFooterProps = {
  className?: string;
};

export function LayoutFooter({ className }: LayoutFooterProps) {
  return (
    <footer
      className={cn(
        "mt-16 bg-(--commerce-primary-main) text-(--commerce-text-inverse)",
        className,
      )}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-[160px]">
        {/* top */}
        <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-[20px] font-medium leading-6"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            Cursor Commerce
          </Link>

          <nav aria-label="푸터 링크" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
          </nav>

          <div className="flex items-center gap-3" aria-label="소셜 미디어">
            <IconLink href="https://twitter.com" label="Twitter">
              <FaTwitter className="size-5" aria-hidden />
            </IconLink>
            <IconLink href="https://instagram.com" label="Instagram">
              <FaInstagram className="size-5" aria-hidden />
            </IconLink>
            <IconLink href="https://github.com" label="GitHub">
              <FaGithub className="size-5" aria-hidden />
            </IconLink>
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-(--commerce-border-strong)/60 py-5">
          <div className="flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-(--commerce-background-elevated)">
              Copyright © 2026 Cursor Commerce. All rights reserved
            </p>
            <div className="flex items-center gap-4">
              <FooterLink href="/privacy" className="text-(--commerce-text-inverse)">
                Privacy Policy
              </FooterLink>
              <FooterLink href="/terms" className="text-(--commerce-text-inverse)">
                Terms of Use
              </FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm leading-[22px] text-(--commerce-text-inverse)/95 transition-opacity hover:opacity-80",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        className,
      )}
      style={{ fontFamily: "var(--commerce-font-body)" }}
    >
      {children}
    </Link>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/15",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
      )}
    >
      {children}
    </a>
  );
}

