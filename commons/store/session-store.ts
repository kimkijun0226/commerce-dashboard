import { create } from "zustand";

/**
 * 사용자 역할
 *
 * - `supabase/migrations/0001_init_schema.sql`의 `public.user_role` enum과 일치합니다.
 */
export type UserRole = "user" | "admin";

export interface UserSession {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
}

export interface SessionState {
  /** 현재 로그인한 사용자(없으면 null) */
  user: UserSession | null;

  /** 인증 여부 (user !== null 기반 자동 계산) */
  isAuthenticated: boolean;

  /** 관리자 여부 (user?.role === "admin" 기반 자동 계산) */
  isAdmin: boolean;

  /** 사용자 세션 설정(로그인/세션 복원 등에서 사용) */
  setUser: (user: UserSession) => void;

  /** 사용자 세션 제거(로그아웃 등에서 사용) */
  clearUser: () => void;
}

/**
 * 유저 세션 Zustand 스토어 (메모리 전용)
 *
 * - persist를 사용하지 않습니다.
 * - isAuthenticated/isAdmin은 user 상태를 기반으로 항상 일관되게 유지됩니다.
 */
export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: true,
      isAdmin: user.role === "admin",
    });
  },

  clearUser: () => {
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },
}));
