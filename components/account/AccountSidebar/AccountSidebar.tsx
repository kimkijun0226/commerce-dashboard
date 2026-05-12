"use client";

import { createClient } from "@/lib/supabase/browser";
import type { UserRole } from "@/types/supabase";
import { cn } from "@/components/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiCamera } from "react-icons/fi";
import { toast } from "sonner";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import { commerceColors } from "@/commons/constants/color";
import { useMemo, useRef, useState } from "react";

export type AccountSidebarProps = {
  displayName: string | null;
  email: string;
  role: UserRole;
  imageUrl?: string | null;
  /** 미작성 상품평 건수(0이면 배지 숨김) — 마이쿠팡식 알림 */
  pendingReviewCount?: number;
};

function initials(displayName: string | null, email: string) {
  const base = (displayName ?? email).trim();
  if (!base) return "?";
  const parts = base.split(/\s+/).filter(Boolean);
  const ch = (parts[0]?.[0] ?? base[0] ?? "?").toUpperCase();
  return ch;
}

export function AccountSidebar({
  displayName,
  email,
  role,
  imageUrl,
  pendingReviewCount = 0,
}: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const lastUploadedHashRef = useRef<string | null>(null);

  const sidebarLabel = displayName?.trim() || email.split("@")[0] || "Member";
  const avatarLabel = useMemo(() => `${sidebarLabel} 프로필 이미지`, [sidebarLabel]);

  const items: {
    label: string;
    href: string;
    disabled?: boolean;
    match?: (p: string) => boolean;
    badgeCount?: number;
  }[] = [
    { label: "Account", href: ACCOUNT_URLS.ACCOUNT, match: (p) => p === ACCOUNT_URLS.ACCOUNT },
    {
      label: "Orders",
      href: ACCOUNT_URLS.ORDERS,
      match: (p) => p === ACCOUNT_URLS.ORDERS || p.startsWith(`${ACCOUNT_URLS.ORDERS}/`),
    },
    {
      label: "상품평",
      href: ACCOUNT_URLS.REVIEWS,
      match: (p) => p === ACCOUNT_URLS.REVIEWS,
      badgeCount: pendingReviewCount > 0 ? pendingReviewCount : undefined,
    },
    {
      label: "Wishlist",
      href: ACCOUNT_URLS.WISHLIST,
      match: (p) => p === ACCOUNT_URLS.WISHLIST,
    },
    ...(role === "admin"
      ? [
          {
            label: "Dashboard",
            href: "/admin",
            match: (p: string) => p.startsWith("/admin"),
          },
        ]
      : []),
  ];

  return (
    <aside
      className="w-full shrink-0 rounded-lg bg-(--commerce-background-light) lg:w-[262px]"
      style={{ fontFamily: "var(--commerce-font-body)" }}
    >
      <div className="flex flex-col items-center px-4 pb-6 pt-10">
        <div className="group relative">
          <button
            type="button"
            className={cn(
              "relative flex size-20 items-center justify-center overflow-hidden rounded-full",
              "cursor-pointer select-none",
              "transition-[box-shadow,transform] duration-200 ease-out",
              "hover:shadow-[0_0_0_4px_rgba(55,125,255,0.15)]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-semantic-info)]",
              uploading && "cursor-not-allowed opacity-80",
            )}
            style={{ backgroundColor: commerceColors.primary.dark }}
            aria-label={avatarLabel}
            onClick={() => {
              if (uploading) return;
              fileRef.current?.click();
            }}
          >
            {localImageUrl ? (
              // data URL 표시 (Storage URL은 다음 과제)
              <img
                src={localImageUrl}
                alt={avatarLabel}
                className="size-full object-cover"
              />
            ) : (
              <span
                className="text-[18px] font-semibold text-(--commerce-text-inverse)"
                aria-hidden
              >
                {initials(displayName, email)}
              </span>
            )}
            <span
              className={cn(
                "pointer-events-none absolute inset-0 opacity-100",
              )}
              style={{
                // 이미지/이니셜 모두에서 텍스트 대비와 깊이감을 약하게 주는 오버레이
                background: "linear-gradient(180deg, rgba(20,23,24,0.06) 0%, rgba(20,23,24,0.18) 100%)",
              }}
              aria-hidden
            />
          </button>

          <button
            type="button"
            className={cn(
              "absolute -bottom-0.5 -right-0.5 flex size-[30px] items-center justify-center rounded-full border-2 border-white",
              "cursor-pointer",
              "shadow-sm",
              "transition-transform duration-200 ease-out will-change-transform",
              "group-hover:scale-[1.12]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--commerce-semantic-info)]",
              uploading && "cursor-not-allowed opacity-80",
            )}
            style={{ backgroundColor: commerceColors.primary.main }}
            aria-label="프로필 이미지 변경"
            onClick={() => {
              if (uploading) return;
              fileRef.current?.click();
            }}
          >
            <FiCamera
              className={cn(
                "size-4 text-white transition-transform duration-200 ease-out",
                "group-hover:rotate-[-8deg] group-hover:scale-[1.05]",
              )}
              aria-hidden
            />
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.currentTarget.files?.[0] ?? null;
              e.currentTarget.value = "";
              if (!file) return;
              if (!file.type.startsWith("image/")) {
                toast.error("이미지 파일만 업로드할 수 있습니다.");
                return;
              }
              // data URL은 크기가 커질 수 있어 상한을 둠 (대략 2MB)
              if (file.size > 2 * 1024 * 1024) {
                toast.error("이미지가 너무 큽니다. 2MB 이하로 업로드해 주세요.");
                return;
              }

              setUploading(true);
              try {
                // 같은 파일을 다시 눌러도(또는 같은 내용) 중복 처리로 꼬이지 않게 간단 해시 사용
                const quickHash = `${file.name}:${file.size}:${file.lastModified}`;
                if (quickHash === lastUploadedHashRef.current) {
                  toast.message("같은 이미지를 선택했습니다.");
                  return;
                }

                const dataUrl = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onerror = () => reject(new Error("파일을 읽지 못했습니다."));
                  reader.onload = () => resolve(String(reader.result ?? ""));
                  reader.readAsDataURL(file);
                });
                if (!dataUrl.startsWith("data:")) {
                  throw new Error("data URL 생성에 실패했습니다.");
                }
                if (dataUrl === localImageUrl) {
                  toast.message("같은 이미지를 선택했습니다.");
                  lastUploadedHashRef.current = quickHash;
                  return;
                }

                const supabase = createClient();
                const {
                  data: { user },
                  error: userErr,
                } = await supabase.auth.getUser();
                if (userErr || !user) {
                  throw new Error("로그인이 필요합니다.");
                }

                const { error } = await supabase
                  .from("users")
                  .update({ image_url: dataUrl })
                  .eq("id", user.id);
                if (error) throw new Error(error.message);

                setLocalImageUrl(dataUrl);
                lastUploadedHashRef.current = quickHash;
                toast.success("프로필 이미지가 저장되었습니다.");
                router.refresh();
              } catch (err) {
                const msg = err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.";
                toast.error(msg);
              } finally {
                setUploading(false);
              }
            }}
          />
        </div>
        <p className="mt-2 max-w-[200px] truncate text-center text-[20px] font-semibold leading-8 text-black">
          {sidebarLabel}
        </p>
      </div>

      <nav className="flex flex-col px-4 pb-8" aria-label="Account menu">
        {items.map(({ label, href, disabled, match, badgeCount }) => {
          const active = match ? match(pathname) : false;
          const content = (
            <span className="inline-flex items-center gap-2">
              <span
                className={cn(
                  "block py-2 text-[16px] font-semibold leading-[26px]",
                  active
                    ? "text-(--commerce-primary-main)"
                    : "text-(--commerce-text-secondary)",
                  disabled && "cursor-not-allowed opacity-80",
                )}
              >
                {label}
              </span>
              {badgeCount != null && badgeCount > 0 ? (
                <span
                  className="min-h-[22px] min-w-[22px] shrink-0 rounded-full px-1.5 text-center text-[11px] font-bold leading-[22px] text-white"
                  style={{ backgroundColor: commerceColors.primary.main }}
                  aria-label={`미작성 상품평 ${badgeCount}건`}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              ) : null}
            </span>
          );

          if (disabled) {
            return (
              <button
                key={label}
                type="button"
                className={cn(
                  "border-b border-transparent text-left transition-colors",
                  "hover:text-(--commerce-text-primary)",
                )}
                onClick={() => toast.message("준비 중인 메뉴입니다.")}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "border-b transition-colors",
                active
                  ? "border-(--commerce-primary-main)"
                  : "border-transparent hover:border-(--commerce-border-subtle)",
              )}
            >
              {content}
            </Link>
          );
        })}

        <button
          type="button"
          className="mt-1 border-b border-transparent text-left"
          onClick={async () => {
            const supabase = createClient();
            const { error } = await supabase.auth.signOut();
            if (error) {
              toast.error(
                error.message ||
                  "로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.",
              );
              return;
            }
            toast.success("로그아웃되었습니다.");
            router.push("/");
            router.refresh();
          }}
        >
          <span className="block py-2 text-[16px] font-semibold leading-[26px] text-(--commerce-text-secondary) hover:text-(--commerce-text-primary)">
            Log Out
          </span>
        </button>
      </nav>
    </aside>
  );
}

