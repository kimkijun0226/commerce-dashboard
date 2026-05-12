"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/commons/store/session-store";
import { useCartStore } from "@/commons/store/cart-store";

/**
 * Checkout은 서버(DB)에서 cart_items를 읽는다.
 * 그런데 client-side 장바구니(로컬 store)가 아직 서버로 sync되지 않으면
 * Checkout이 비어 보일 수 있어서, "초기 로드가 비었을 때" 한 번 sync 후 refresh한다.
 */
export function CheckoutCartSyncer({ initialEmpty }: { initialEmpty: boolean }) {
  const router = useRouter();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const userId = useSessionStore((s) => s.user?.id ?? null);
  const syncWithServer = useCartStore((s) => s.syncWithServer);

  useEffect(() => {
    if (!initialEmpty) return;
    if (!isAuthenticated || !userId) return;
    let cancelled = false;
    (async () => {
      await syncWithServer(userId);
      if (!cancelled) router.refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [initialEmpty, isAuthenticated, router, syncWithServer, userId]);

  return null;
}

