"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useSessionStore } from "@/commons/store/session-store";

export type UseAuthResult = {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
};

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setStoreUser = useSessionStore((s) => s.setUser);
  const clearStoreUser = useSessionStore((s) => s.clearUser);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const userId = user?.id ?? null;

  // Provider가 전역 동기화를 담당하지만, useAuth만 단독으로 쓰는 화면에서도
  // store가 비어있지 않게 최소 동기화를 한 번 더 보장합니다.
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      clearStoreUser();
      return;
    }
    setStoreUser({
      id: user.id,
      email: user.email ?? "",
      displayName:
        (user.user_metadata?.displayName as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
      role: "user",
    });
  }, [user, isLoading, setStoreUser, clearStoreUser]);

  return {
    user,
    userId,
    isLoading,
    isLoggedIn: userId !== null,
  };
}
