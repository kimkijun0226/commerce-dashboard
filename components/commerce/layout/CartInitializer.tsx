"use client";

import { useInitCart } from "@/commons/hooks/useInitCart";

export function CartInitializer() {
  useInitCart();
  return null;
}

