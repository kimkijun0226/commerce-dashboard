"use client";

/**
 * 게스트 위시리스트 (탭/브라우저 생명주기)
 * - sessionStorage: 같은 탭에서 라우트 이동/로그인 페이지 이동은 유지
 * - 탭/브라우저 종료 시 자동 삭제
 */

const KEY = "guest_like_product_ids_v1";
const WARN_KEY = "guest_like_warned_v1";

function safeParse(v: string | null): string[] {
  if (!v) return [];
  try {
    const arr = JSON.parse(v) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => typeof x === "string") as string[];
  } catch {
    return [];
  }
}

export function getGuestLikedIds(): string[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.sessionStorage.getItem(KEY));
}

export function isGuestLiked(productId: string): boolean {
  return getGuestLikedIds().includes(productId);
}

export function setGuestLiked(productId: string, liked: boolean): string[] {
  if (typeof window === "undefined") return [];
  const prev = new Set(getGuestLikedIds());
  if (liked) prev.add(productId);
  else prev.delete(productId);
  const next = Array.from(prev);
  window.sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearGuestLikes() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}

export function shouldShowGuestLikeWarn(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(WARN_KEY) !== "1";
}

export function markGuestLikeWarnShown() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(WARN_KEY, "1");
}

