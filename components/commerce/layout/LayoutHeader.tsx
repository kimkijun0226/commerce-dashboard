"use client";

import { cn } from "@/components/ui";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { useState } from "react";
import { FiMenu, FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import { SearchOverlay } from "@/features/search/components/SearchOverlay";
import { useSearchStore } from "@/features/search/store/searchStore";

export type LayoutHeaderProps = {
  className?: string;
  cartCount?: number;
};

export function LayoutHeader({ className, cartCount = 2 }: LayoutHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const openSearch = useSearchStore((s) => s.open);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50",
          "border-b bg-(--commerce-background-default)",
          "border-(--commerce-border-subtle)",
          className,
        )}
      >
        <div className="mx-auto flex h-[60px] max-w-[1440px] items-center px-4 sm:px-[160px]">
        <button
          type="button"
          className="mr-3 inline-flex items-center justify-center rounded-md p-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info) sm:hidden"
          aria-label="메뉴 열기"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <FiMenu className="size-6" aria-hidden />
        </button>

        <Link
          href="/"
          className="min-w-0 text-[24px] font-medium leading-6 tracking-normal text-black"
          style={{ fontFamily: "var(--commerce-font-heading)" }}
        >
          Cursor Commerce
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <IconBtn aria-label="검색" onClick={() => openSearch()}>
            <FiSearch className="size-6" aria-hidden />
          </IconBtn>

          <Link href="/account" className="inline-flex">
            <IconBtn aria-label="내 계정">
              <FiUser className="size-6" aria-hidden />
            </IconBtn>
          </Link>

          <Link href="/cart" className="inline-flex">
            <IconBtn aria-label="장바구니" className="relative">
              <FiShoppingBag className="size-6" aria-hidden />
              {cartCount > 0 ? (
                <span
                  className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full text-[12px] font-bold leading-5"
                  style={{
                    backgroundColor: "var(--commerce-primary-main)",
                    color: "var(--commerce-text-inverse)",
                    fontFamily: "Inter",
                  }}
                >
                  {Math.min(cartCount, 99)}
                </span>
              ) : null}
            </IconBtn>
          </Link>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          className="border-t border-(--commerce-border-subtle) bg-(--commerce-background-default) sm:hidden"
          aria-label="모바일 메뉴"
        >
          <div className="mx-auto max-w-[1440px] px-4 py-3">
            <div className="flex flex-col gap-2 text-[14px] font-medium leading-6">
              <Link href="/" className="rounded px-2 py-2 text-(--commerce-text-primary)">
                Home
              </Link>
              <Link href="/products" className="rounded px-2 py-2 text-(--commerce-text-secondary)">
                Shop
              </Link>
              <Link href="/products" className="rounded px-2 py-2 text-(--commerce-text-secondary)">
                Product
              </Link>
              <Link href="/account" className="rounded px-2 py-2 text-(--commerce-text-secondary)">
                Contact Us
              </Link>
            </div>
          </div>
        </nav>
      ) : null}
      </header>

      <SearchOverlay />
    </>
  );
}

function IconBtn({
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2",
        "text-(--commerce-text-primary)",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
