export type UserRole = "user" | "super_admin";

export interface UserSession {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
}

export interface SessionState {
  user: UserSession | null;
  isLoading: boolean;
}

const USER_ROLES: UserRole[] = ["user", "super_admin"];

export function isUserSession(value: unknown): value is UserSession {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.email === "string" &&
    (o.displayName === null || typeof o.displayName === "string") &&
    typeof o.role === "string" &&
    USER_ROLES.includes(o.role as UserRole)
  );
}
