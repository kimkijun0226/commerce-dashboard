/**
 * 체크아웃·결제 리다이렉트 화면용 문구 (orders.status / payment_status 와 대응)
 */
export const checkoutMessages = {
  /** 리다이렉트 직후 서버 확인 중 */
  paymentVerifying: "결제 결과를 확인하는 중입니다.",

  /** 이번 요청에서 토스 승인까지 성공한 직후 */
  paymentCompleted: "결제가 완료되었습니다.",

  /** orders.status === "pending" — 결제 전·결제 대기 */
  orderPendingProcessing: "주문 처리 중입니다.",

  /** orders.status === "paid" — 결제 반영 후 배송 준비 등 */
  orderPaidProcessing: "주문이 처리 중입니다.",

  /** 결제창 실패 리다이렉트 (일반) */
  paymentFailed: "결제에 실패했습니다.",

  /** DB에 실패 반영 후, 재결제 가능 상태 안내 */
  paymentFailedOrderStillPending: "결제에 실패했습니다. 주문은 결제 대기 상태입니다. 다시 결제해 주세요.",

  /** 결제 취소/실패 후 주문을 종료 처리 */
  orderCanceled: "주문이 취소되었습니다.",

  /** 토스 승인 API 오류 등 */
  paymentConfirmFailed: "결제 승인에 실패했습니다.",

  /** orderId 없이 fail URL만 온 경우(사용자 취소 등) */
  paymentCancelledOrIncomplete: "결제가 완료되지 않았습니다.",

  loginRequired: "로그인이 필요합니다.",
  orderNotFound: "주문을 찾을 수 없습니다.",
  orderAccessDenied: "이 주문에 접근할 권한이 없습니다.",
  amountMismatch: "결제 금액이 주문과 일치하지 않습니다. 고객센터로 문의해 주세요.",
  paymentRecordNotFound: "결제 정보를 찾을 수 없습니다.",
  paymentSaveFailed: "결제 정보를 저장하지 못했습니다.",
  orderSaveFailed: "주문 상태를 저장하지 못했습니다.",
} as const;
