"use client";

import { create } from "zustand";

export interface SearchState {
  isOpen: boolean;
  keyword: string;

  open: () => void;
  close: () => void;
  setKeyword: (value: string) => void;
  clear: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  keyword: "",

  open: () => set({ isOpen: true }),
  close: () => set((s) => ({ ...s, isOpen: false })),
  setKeyword: (value) => set({ keyword: value }),
  clear: () => set({ isOpen: false, keyword: "" }),
}));

