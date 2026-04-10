"use client";

import { useEffect, useRef } from "react";

export type UseInfiniteScrollOptions = {
  onLoadMore: () => void;
  enabled?: boolean;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
};

export function useInfiniteScroll({
  onLoadMore,
  enabled = true,
  root = null,
  rootMargin = "0px 0px 300px 0px",
  threshold = 0,
}: UseInfiniteScrollOptions) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) onLoadMore();
      },
      { root, rootMargin, threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, onLoadMore, root, rootMargin, threshold]);

  return ref;
}

