"use client";

import { catalogFilterUrl } from "@/lib/catalog/campaigns";
import { STOREFRONTS, storeFromPath } from "@/lib/catalog/storefront";
import { useSessionStore } from "@/commons/store/session-store";
import Image from "next/image";
import { cn } from "@/components/ui";
import { useCartStore } from "@/commons/store/cart-store";
import { useSearchStore } from "@/features/search/store/searchStore";
import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ButtonHTMLAttributes } from "react";
import { useEffect, useState } from "react";
import { HomeSearchBar } from "@/features/search/components/HomeSearchBar";
import { FiMenu, FiSearch, FiShoppingCart, FiUser } from "react-icons/fi";

export type LayoutHeaderProps = {
  logos?: Record<string,string>;
  className?: string;
  cartCount?: number;
};

export function LayoutHeader({ logos, className, cartCount }: LayoutHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const store = STOREFRONTS[storeFromPath(pathname)];
  const isAuthenticated = useSessionStore(s => s.isAuthenticated);
  const totalQuantity = useCartStore((s) => s.totalQuantity);
  const displayCartCount = cartCount ?? totalQuantity;
  const isSearchOpen = useSearchStore((s) => s.isOpen);
  const openSearch = useSearchStore((s) => s.open);
  const closeSearch = useSearchStore((s) => s.close);

  useEffect(() => {
    if (isSearchOpen) document.getElementById("header-search-input")?.focus();
  }, [isSearchOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50",
        "border-b bg-(--commerce-background-default)",
        "border-(--commerce-border-subtle)",
        className,
      )}
    >
      <div className="mx-auto flex h-[60px] max-w-[1800px] items-center px-3 sm:px-6 lg:px-8">
        <button
          type="button"
          className="mr-2 inline-flex items-center justify-center rounded-md p-1.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info) sm:hidden"
          aria-label="메뉴 열기"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <FiMenu className="size-5 sm:size-6" aria-hidden />
        </button>

        <Link
          href={store.path}
          aria-label={`레비 · ${store.name} 홈`}
          className="flex min-w-0 items-center gap-2 sm:gap-3"
          style={{ fontFamily: "var(--commerce-font-heading)" }}
        >
          <Image src={logos?.[store.key] ?? "/brand/revie-logo.svg"} unoptimized alt="RÊVIE" width={112} height={25} className="h-6 w-20 object-contain sm:h-7 sm:w-28" />
          <span className="hidden min-[400px]:inline border-l border-(--commerce-border-subtle) pl-2 text-xs font-medium text-(--commerce-primary-main) sm:pl-3 sm:text-sm">{store.name}</span>
        </Link>

        <div className={cn("mx-auto w-full max-w-[480px] sm:ml-auto sm:mr-5 sm:w-[38%]", isSearchOpen ? "absolute inset-x-0 top-[60px] border-b border-(--commerce-border-subtle) bg-(--commerce-background-default) p-3 shadow-sm sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none" : "hidden sm:block")}>
          <HomeSearchBar inputId="header-search-input" placeholder={store.search} onEscape={closeSearch} onSubmitSearch={() => {
              if (pathname !== store.path) router.push(catalogFilterUrl(store.key, { q: useSearchStore.getState().keyword }));
              else document.getElementById("catalog-products")?.scrollIntoView({ block: "start" });
              closeSearch();
            }}
            className="!rounded-[3px] !border-transparent !bg-(--commerce-background-light) !py-2.5 text-sm" />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 pl-1 sm:ml-0 sm:gap-3">
          <IconBtn
            aria-label={isSearchOpen ? "검색 닫기" : "검색 열기"}
            aria-expanded={isSearchOpen}
            onClick={() => {
              if (isSearchOpen) {
                closeSearch();
                return;
              }
              openSearch();
            }}
            className={cn(
              "sm:hidden transition-colors hover:bg-(--commerce-background-light) active:bg-(--commerce-background-elevated)",
              isSearchOpen
                ? "text-(--commerce-semantic-info)"
                : "text-(--commerce-text-primary)",
            )}
          >
            <FiSearch className="size-5 sm:size-6" aria-hidden />
          </IconBtn>

          {isAuthenticated ? <IconBtn href="/account" aria-label="마이페이지"><FiUser className="size-5 sm:size-6" aria-hidden /></IconBtn> : null}

          <span data-cart-target className="relative inline-flex">
          <IconBtn href="/cart" aria-label="장바구니" className="relative">
            <FiShoppingCart className="size-5 sm:size-6" aria-hidden />
            {displayCartCount > 0 ? (
              <span
                className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full text-[12px] font-bold leading-5"
                style={{
                  backgroundColor: "var(--commerce-primary-main)",
                  color: "var(--commerce-text-inverse)",
                  fontFamily: "Inter",
                }}
              >
                {Math.min(displayCartCount, 99)}
              </span>
            ) : null}
          </IconBtn>
          </span>
          {!isAuthenticated ? <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="ml-1 inline-flex min-h-9 items-center rounded-[3px] bg-(--commerce-primary-main) px-3 text-xs font-semibold text-white transition-opacity hover:opacity-80 sm:px-4 sm:text-sm">로그인</Link> : null}
        </div>
      </div>

      {mobileOpen ? (
        <nav
          className="border-t border-(--commerce-border-subtle) bg-(--commerce-background-default) sm:hidden"
          aria-label="모바일 메뉴"
        >
          <div className="mx-auto max-w-[1440px] px-4 py-3">
            <div className="flex flex-col gap-2 text-[14px] font-medium leading-6">
              {Object.values(STOREFRONTS).map(item => <Link key={item.key} href={item.path} onClick={() => setMobileOpen(false)} className="rounded px-2 py-2 text-(--commerce-text-primary)">레비 · {item.name}</Link>)}
              <Link href={isAuthenticated ? "/account" : "/login"} onClick={() => setMobileOpen(false)} className="rounded px-2 py-2 text-(--commerce-text-primary)">{isAuthenticated ? "마이페이지" : "로그인 / 회원가입"}</Link>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function IconBtn({
  href,
  className,
  children,
  ...rest
}: (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }) | (Omit<LinkProps, "href"> & { href: string } & { className?: string; children?: React.ReactNode; ["aria-label"]?: string })) {
  const base = cn(
    "inline-flex items-center justify-center rounded-md p-1.5 sm:p-2",
    "text-(--commerce-text-primary)",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
    className,
  );

  if (href) {
    // Link 렌더링 시 <a>가 되므로 button 중첩/Link 안 button 문제를 피할 수 있습니다.
    const linkProps = rest as Omit<LinkProps, "href">;
    return (
      <Link href={href} className={base} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={base}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
