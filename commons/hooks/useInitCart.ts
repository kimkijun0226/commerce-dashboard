"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/commons/store/session-store";
import { useCartStore } from "@/commons/store/cart-store";

export function useInitCart() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const userId = useSessionStore((s) => s.user?.id ?? null);
  const syncWithServer = useCartStore((s) => s.syncWithServer);
  const resetForGuest = useCartStore((s) => s.resetForGuest);
  const lastSyncedAuthRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      lastSyncedAuthRef.current = false;
      resetForGuest();
      return;
    }
    if (lastSyncedAuthRef.current === true) return;
    lastSyncedAuthRef.current = true;
    void syncWithServer(userId);
  }, [isAuthenticated, userId, resetForGuest, syncWithServer]);
}

