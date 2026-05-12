"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { User } from "@supabase/supabase-js";

import {
  useSessionStore,
  type UserRole,
  type UserSession,
} from "@/commons/store/session-store";
import { useCartStore } from "@/commons/store/cart-store";
import { createClient } from "@/lib/supabase/browser";
import { mergeGuestLikes } from "@/app/(commerce)/likes/actions";
import { clearGuestLikes, getGuestLikedIds } from "@/components/commerce/likes/guestLikes";
import { ConfirmDialog } from "@/components/ui";
import { toast } from "sonner";

async function buildUserSession(user: User): Promise<UserSession> {
  const supabase = createClient();

  const fallback: UserSession = {
    id: user.id,
    email: user.email ?? "",
    displayName:
      (user.user_metadata?.displayName as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    role: "user",
  };

  try {
    const { data, error } = await supabase
      .from("users")
      .select("display_name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) return fallback;

    return {
      ...fallback,
      displayName: data.display_name ?? fallback.displayName,
      role: (data.role as UserRole) ?? fallback.role,
    };
  } catch {
    return fallback;
  }
}

/**
 * Supabase Auth 세션 상태를 감지해 zustand(useSessionStore)와 동기화합니다.
 *
 * - 새로고침 시 getSession()으로 복원
 * - onAuthStateChange로 로그인/로그아웃/토큰 갱신 이벤트 반영
 */
export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useSessionStore((s) => s.setUser);
  const clearUser = useSessionStore((s) => s.clearUser);
  const bumpLikesSyncNonce = useSessionStore((s) => s.bumpLikesSyncNonce);
  const resetCartForGuest = useCartStore((s) => s.resetForGuest);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const promptedRef = useRef<string | null>(null);

  const [syncOpen, setSyncOpen] = useState(false);
  const [guestLikeIds, setGuestLikeIds] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const guestLikeCount = guestLikeIds.length;
  const syncTitle = useMemo(() => {
    if (guestLikeCount <= 0) return "동기화할까요?";
    return `게스트 위시리스트 ${guestLikeCount}개를 동기화할까요?`;
  }, [guestLikeCount]);

  useEffect(() => {
    const supabase = createClient();

    const sync = async (user: User | null) => {
      if (!user) {
        clearUser();
        resetCartForGuest();
        return;
      }
      const sessionUser = await buildUserSession(user);
      setUser(sessionUser);

      // ✅ 로그인 직후: 게스트 찜이 있으면 "동기화할까요?" 모달을 1회 노출
      if (promptedRef.current !== user.id) {
        const ids = getGuestLikedIds();
        if (ids.length > 0) {
          promptedRef.current = user.id;
          setGuestLikeIds(ids);
          setSyncOpen(true);
        }
      }
    };

    // 최초 복원
    inFlightRef.current = supabase.auth
      .getSession()
      .then(({ data }) => sync(data.session?.user ?? null))
      .catch(() => clearUser());

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // 이벤트가 연속으로 올 때 레이스를 줄이기 위해 순차 처리
      const next = async () => sync(session?.user ?? null);
      inFlightRef.current = (inFlightRef.current ?? Promise.resolve()).then(next, next);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, clearUser, resetCartForGuest]);

  return (
    <>
      {children}
      <ConfirmDialog
        open={syncOpen}
        title={syncTitle}
        description={
          "로그인 전에 누른 위시리스트를 계정으로 옮기면, 메인/상세/마이페이지에서 바로 동일하게 보여요."
        }
        confirmText="동기화"
        cancelText="나중에"
        confirmVariant="primary"
        isPending={pending}
        onClose={() => {
          // 나중에: 게스트 상태 데이터는 로그인 상태에선 의미가 없으므로 정리
          clearGuestLikes();
          setGuestLikeIds([]);
          setSyncOpen(false);
        }}
        onConfirm={() => {
          startTransition(async () => {
            try {
              await mergeGuestLikes(guestLikeIds);
              clearGuestLikes();
              setGuestLikeIds([]);
              setSyncOpen(false);
              bumpLikesSyncNonce();
              toast.success("위시리스트가 동기화되었습니다.");
            } catch {
              toast.error("동기화에 실패했어요. 잠시 후 다시 시도해 주세요.");
            }
          });
        }}
      />
    </>
  );
}

