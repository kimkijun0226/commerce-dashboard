"use client";

import { AUTH_URLS } from "@/commons/constants/url";
import { isProductLiked, toggleLikeItem } from "@/app/(commerce)/likes/actions";
import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSessionStore } from "@/commons/store/session-store";
import {
  isGuestLiked,
  markGuestLikeWarnShown,
  setGuestLiked,
  shouldShowGuestLikeWarn,
} from "@/components/commerce/likes/guestLikes";

function isAuthRequiredError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const anyErr = e as { name?: string; message?: string };
  if (anyErr.name === "AuthRequiredError") return true;
  if (anyErr.message && anyErr.message.includes("로그인이 필요")) return true;
  return false;
}

export type UseLikeToggleResult = {
  liked: boolean;
  pending: boolean;
  ariaLabel: string;
  toggle: () => void;
};

export type UseLikeToggleOptions = {
  /** 목록에서 배치로 liked를 미리 주입한 경우, 개별 동기화를 건너뜁니다. */
  syncOnMount?: boolean;
};

export function useLikeToggle(
  productId: string,
  initialLiked = false,
  options?: UseLikeToggleOptions,
): UseLikeToggleResult {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthed = useSessionStore((s) => s.isAuthenticated);
  const likesSyncNonce = useSessionStore((s) => s.likesSyncNonce);
  const [pending, startTransition] = useTransition();
  const syncOnMount = options?.syncOnMount !== false;
  const [likedState, setLikedState] = useState<boolean>(initialLiked);
  /**
   * syncOnMount=false(배치 주입)에서는 initialLiked가 나중에 바뀔 수 있어
   * effect로 setState를 맞추지 않고 override만 따로 둡니다.
   */
  const [overrideLiked, setOverrideLiked] = useState<boolean | undefined>(
    undefined,
  );

  const [guestOverride, setGuestOverride] = useState<{
    productId: string;
    liked: boolean;
  } | null>(null);

  const liked = !isAuthed
    ? guestOverride?.productId === productId
      ? guestOverride.liked
      : isGuestLiked(productId)
    : syncOnMount
      ? likedState
      : (overrideLiked ?? initialLiked);

  useEffect(() => {
    if (!syncOnMount) return;
    if (!isAuthed) return;
    let cancelled = false;
    startTransition(async () => {
      try {
        const v = await isProductLiked(productId);
        if (!cancelled) setLikedState(v);
      } catch {
        // noop
      }
    });
    return () => {
      cancelled = true;
    };
  }, [productId, startTransition, syncOnMount, isAuthed, likesSyncNonce]);

  const ariaLabel = useMemo(
    () => (liked ? "위시리스트에서 제거" : "위시리스트에 추가"),
    [liked],
  );

  const toggle = () => {
    // ✅ 즉시 반응(optimistic)은 동기적으로 먼저 반영
    const prev = liked;
    if (!isAuthed) {
      const next = !prev;
      // ✅ 게스트도 즉시 렌더링이 바뀌도록 override state로 반영
      setGuestOverride({ productId, liked: next });
      setGuestLiked(productId, next);
      if (shouldShowGuestLikeWarn()) {
        markGuestLikeWarnShown();
        toast.message(
          "로그인하지 않으면 위시리스트는 이 세션에서만 임시 저장돼요. 로그인하면 계정으로 옮겨드릴게요.",
        );
      }
      return;
    }

    if (syncOnMount) setLikedState(!prev);
    else setOverrideLiked(!prev);

    // ✅ 서버 통신/refresh는 transition으로 처리
    startTransition(async () => {
      try {
        const res = await toggleLikeItem(productId);
        if (syncOnMount) setLikedState(res.isLiked);
        else setOverrideLiked(res.isLiked);
        toast.success(res.isLiked ? "찜 목록에 추가했어요." : "찜을 해제했어요.");
        router.refresh();
      } catch (e) {
        if (syncOnMount) setLikedState(prev);
        else setOverrideLiked(prev); // rollback
        if (isAuthRequiredError(e)) {
          toast.error("로그인이 필요해요.");
          const next = pathname || "/";
          router.push(`${AUTH_URLS.LOGIN}?next=${encodeURIComponent(next)}`);
          return;
        }
        toast.error("찜하기 처리에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
    });
  };

  return { liked, pending, ariaLabel, toggle };
}

