const REVIEW_ACTION_ERROR_RE =
  /^(AUTH_REQUIRED|NOT_FOUND|FORBIDDEN|VALIDATION|DUPLICATE_REVIEW|PURCHASE_REQUIRED|ALL_ORDERS_REVIEWED):([\s\S]+)$/;

/** 클라이언트 토스트용: `CODE:메시지` 형태면 메시지 본문만 반환 */
export function formatReviewActionError(err: unknown): string {
  if (!(err instanceof Error)) return "처리에 실패했습니다.";
  const m = REVIEW_ACTION_ERROR_RE.exec(err.message);
  return m ? m[2].trim() : err.message;
}
