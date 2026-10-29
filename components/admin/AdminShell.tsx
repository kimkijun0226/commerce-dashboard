"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FiGrid,
  FiPackage,
  FiShoppingBag,
  FiSettings,
  FiExternalLink,
} from "react-icons/fi";
import { AdminLayout, AdminHeader, AdminSidebar } from "@/components/admin";
import type { ReactNode } from "react";
const links = [
  { href: "/admin", label: "판매 분석", icon: <FiGrid /> },
  { href: "/admin/live", label: "주문·결제 대시보드", icon: <FiGrid /> },
  { href: "/admin/products", label: "상품 관리", icon: <FiPackage /> },
  { href: "/admin/orders", label: "주문 · 배송", icon: <FiShoppingBag /> },
  { href: "/admin/settings", label: "로고 · 배너", icon: <FiSettings /> },
];
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);
  return (
    <AdminLayout
      headerSlot={
        <>
          <AdminHeader
            brand={
              <span className="inline-flex items-center gap-3 tracking-[0.12em]">
                <Image
                  src="/brand/revie-logo.svg"
                  alt="RÊVIE"
                  width={96}
                  height={28}
                  className="h-7 w-24 object-contain"
                />
                <span className="text-xs text-gray-400">ADMIN</span>
              </span>
            }
            userSlot={
              <Link href="/" className="inline-flex items-center gap-2 text-xs">
                쇼핑몰 보기 <FiExternalLink />
              </Link>
            }
          />
          <nav
            aria-label="모바일 관리자 메뉴"
            className="flex flex-wrap gap-1 border-b bg-white p-2 md:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active(link.href) ? "page" : undefined}
                className={`px-3 py-2 text-xs ${active(link.href) ? "bg-black text-white" : "text-gray-500"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      }
      sidebarSlot={
        <AdminSidebar
          brand="운영 관리"
          className="hidden min-h-[calc(100vh-80px)] md:block"
          sections={[
            {
              id: "manage",
              label: "레비",
              items: links.map((link) => ({
                key: link.href,
                ...link,
                active: active(link.href),
              })),
            },
          ]}
        />
      }
    >
      {children}
    </AdminLayout>
  );
}
