"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { markTossPaymentFailed, type MarkTossPaymentFailedResult } from "../../toss-payment-actions";
import { checkoutMessages } from "@/commons/constants/checkoutMessages";
import { clearSessionPendingOrderId, getSessionPendingOrderId } from "@/commons/utils/order";

export function PaymentFailBody() {
  const sp = useSearchParams();
  const [serverResult, setServerResult] = useState<MarkTossPaymentFailedResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const tossOrderIdFromQuery = sp.get("orderId");
      // PAY_PROCESS_CANCELED 케이스 등으로 failUrl에 orderId가 안 오는 경우가 있어 sessionStorage 값으로 보정
      const tossOrderId = tossOrderIdFromQuery || getSessionPendingOrderId();
      const r = await markTossPaymentFailed({
        tossOrderId,
        code: sp.get("code"),
        message: sp.get("message"),
      });
      if (r.updated || (r.skipped && r.orderStatus)) {
        clearSessionPendingOrderId();
      }
      if (!cancelled) setServerResult(r);
    })();
    return () => {
      cancelled = true;
    };
  }, [sp]);

  const headline =
    serverResult == null
      ? checkoutMessages.paymentVerifying
      : serverResult.skipped && serverResult.orderStatus === "paid"
        ? checkoutMessages.orderPaidProcessing
        : serverResult.skipped && serverResult.orderStatus === "canceled"
          ? checkoutMessages.orderCanceled
        : serverResult.skipped
          ? checkoutMessages.paymentCancelledOrIncomplete
          : serverResult.updated
            ? serverResult.message
            : serverResult.message;

  const phaseLabel =
    serverResult == null
      ? null
      : serverResult.skipped && serverResult.orderStatus === "paid"
        ? "상태: 주문 처리 중 (결제 반영됨)"
        : serverResult.skipped && serverResult.orderStatus === "canceled"
          ? "상태: 주문 취소"
        : serverResult.updated
          ? "상태: 주문 취소"
          : serverResult.skipped
            ? "상태: 결제 미완료"
            : serverResult.error
              ? "상태: 처리 불가"
              : null;

  const payload = {
    query: Object.fromEntries(sp.entries()),
    server: serverResult,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">{headline}</h1>
      {phaseLabel ? (
        <p className="mb-4 text-sm text-neutral-600" aria-live="polite">
          {phaseLabel}
        </p>
      ) : (
        <p className="mb-4 text-sm text-neutral-600">추후 전용 실패 페이지로 교체 예정입니다.</p>
      )}
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">상세 (JSON)</p>
      <pre className="overflow-x-auto rounded-lg bg-neutral-100 p-4 text-xs leading-relaxed">
        {serverResult == null ? JSON.stringify({ loading: true, query: Object.fromEntries(sp.entries()) }, null, 2) : JSON.stringify(payload, null, 2)}
      </pre>
    </main>
  );
}
