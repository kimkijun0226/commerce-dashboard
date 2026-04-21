"use client";

import { useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";

import {
  useSessionStore,
  type UserRole,
  type UserSession,
} from "@/commons/store/session-store";
import { createClient } from "@/lib/supabase/browser";

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
  const inFlightRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const sync = async (user: User | null) => {
      if (!user) {
        clearUser();
        return;
      }
      const sessionUser = await buildUserSession(user);
      setUser(sessionUser);
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
  }, [setUser, clearUser]);

  return <>{children}</>;
}

