"use client";

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs = 350) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

