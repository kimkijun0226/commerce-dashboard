"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { confirmTossPayment, type TossConfirmResult } from "../../toss-payment-actions";
import { checkoutMessages } from "@/commons/constants/checkoutMessages";

/** Strict Mode 이펙트 이중 실행 시 승인 API가 두 번 나가지 않도록 동일 요청을 하나로 합침 */
const confirmInFlight = new Map<string, Promise<TossConfirmResult>>();

function dedupedConfirmTossPayment(args: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossConfirmResult> {
  const key = `${args.paymentKey}:${args.orderId}:${args.amount}`;
  let p = confirmInFlight.get(key);
  if (!p) {
    p = confirmTossPayment(args).finally(() => {
      confirmInFlight.delete(key);
    });
    confirmInFlight.set(key, p);
  }
  return p;
}

type LocalError = { error: string; params: Record<string, string>; message: string };

function isTossConfirmResult(v: TossConfirmResult | LocalError | null): v is TossConfirmResult {
  return v != null && "ok" in v;
}

export function PaymentSuccessBody() {
  const sp = useSearchParams();
  const [result, setResult] = useState<TossConfirmResult | LocalError | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const paymentKey = sp.get("paymentKey");
      const orderId = sp.get("orderId");
      const amountRaw = sp.get("amount");
      if (!paymentKey || !orderId || !amountRaw) {
        if (!cancelled) {
          setResult({
            error: "MISSING_QUERY",
            message: "결제 확인에 필요한 정보가 없습니다.",
            params: Object.fromEntries(sp.entries()),
          });
        }
        return;
      }
      const amount = Number(amountRaw);
      if (!Number.isFinite(amount)) {
        if (!cancelled) {
          setResult({
            error: "INVALID_AMOUNT",
            message: "결제 금액 정보가 올바르지 않습니다.",
            params: Object.fromEntries(sp.entries()),
          });
        }
        return;
      }
      const r = await dedupedConfirmTossPayment({ paymentKey, orderId, amount });
      if (!cancelled) setResult(r);
    })();
    return () => {
      cancelled = true;
    };
  }, [sp]);

  const headline =
    result == null
      ? checkoutMessages.paymentVerifying
      : "message" in result && result.message
        ? result.message
        : checkoutMessages.paymentVerifying;

  const phaseLabel =
    result != null && isTossConfirmResult(result) && result.ok
      ? result.phase === "payment_completed"
        ? "상태: 결제 완료"
        : "상태: 주문 처리 중 (결제 반영됨)"
      : result != null && isTossConfirmResult(result) && !result.ok
        ? "상태: 결제 미완료"
        : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">{headline}</h1>
      {phaseLabel ? (
        <p className="mb-4 text-sm text-neutral-600" aria-live="polite">
          {phaseLabel}
        </p>
      ) : (
        <p className="mb-4 text-sm text-neutral-600">추후 전용 완료 페이지로 교체 예정입니다.</p>
      )}
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">상세 (JSON)</p>
      <pre className="overflow-x-auto rounded-lg bg-neutral-100 p-4 text-xs leading-relaxed">
        {result == null ? JSON.stringify({ loading: true }, null, 2) : JSON.stringify(result, null, 2)}
      </pre>
    </main>
  );
}
