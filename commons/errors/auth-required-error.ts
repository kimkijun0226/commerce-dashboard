/** 로그인이 필요할 때 서버 액션 등에서 throw — 메시지는 클라에서 식별용으로 유지 */
export class AuthRequiredError extends Error {
  override readonly name = "AuthRequiredError";

  constructor() {
    super("AUTH_REQUIRED");
  }
}

export function isAuthRequiredError(error: unknown): boolean {
  if (error instanceof AuthRequiredError) return true;
  if (error instanceof Error && error.message === "AUTH_REQUIRED") return true;
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    String((error as { message: unknown }).message) === "AUTH_REQUIRED"
  );
}
