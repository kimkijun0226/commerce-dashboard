"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const TOSS_SCRIPT_SRC = "https://js.tosspayments.com/v2/standard";
const SCRIPT_ATTR = "data-tosspayments-standard";

export type TossPaymentMethod = "CARD";

export type TossPaymentRequestParams = {
  method?: TossPaymentMethod;
  orderId: string;
  orderName: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerMobilePhone?: string;
};

export type TossPaymentHandle = {
  /** SDK 스크립트 로드 및 `payment()` 인스턴스까지 준비되었는지 */
  ready: boolean;
  requestPayment: (params: TossPaymentRequestParams) => Promise<void>;
};

export type TossPaymentProps = {
  clientKey: string;
  customerKey: string;
  successPath: string;
  failPath: string;
  /** 준비 상태 변경 시 (Checkout UI 비활성 등) */
  onReadyChange?: (ready: boolean) => void;
};

type TossPaymentsInstance = {
  payment: (opts: { customerKey: string }) => {
    requestPayment: (args: Record<string, unknown>) => Promise<void>;
  };
};

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

function loadTossPaymentsScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("window 없음"));
  if (window.TossPayments) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_ATTR}]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      const t0 = Date.now();
      const tick = () => {
        if (window.TossPayments) {
          resolve();
          return;
        }
        if (Date.now() - t0 > 15_000) {
          reject(new Error("TossPayments SDK 로드 시간 초과"));
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = TOSS_SCRIPT_SRC;
    s.async = true;
    s.setAttribute(SCRIPT_ATTR, "1");
    // onload 직후에도 전역 할당이 한 틱 늦을 수 있어 폴링
    s.onload = () => {
      const t0 = Date.now();
      const tick = () => {
        if (window.TossPayments) {
          resolve();
          return;
        }
        if (Date.now() - t0 > 10_000) {
          reject(new Error("TossPayments SDK가 로드되었지만 전역 객체를 찾지 못했습니다."));
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    };
    s.onerror = () => reject(new Error("TossPayments 스크립트 로드 실패"));
    document.head.appendChild(s);
  });
}

function absoluteUrl(path: string) {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export const TossPayment = forwardRef<TossPaymentHandle, TossPaymentProps>(
  function TossPayment({ clientKey, customerKey, successPath, failPath, onReadyChange }, ref) {
    const [ready, setReady] = useState(false);
    /** useImperativeHandle 클로저보다 최신 준비 여부 (제출 직후 레이스 방지) */
    const readyRef = useRef(false);
    const paymentRef = useRef<ReturnType<TossPaymentsInstance["payment"]> | null>(null);
    const initKeyRef = useRef<string>("");

    const setReadySafe = useCallback(
      (v: boolean) => {
        readyRef.current = v;
        setReady(v);
        onReadyChange?.(v);
      },
      [onReadyChange],
    );

    useEffect(() => {
      let cancelled = false;
      const key = `${clientKey}::${customerKey}`;
      if (!clientKey || !customerKey) {
        paymentRef.current = null;
        initKeyRef.current = "";
        setReadySafe(false);
        return;
      }

      (async () => {
        try {
          await loadTossPaymentsScript();
          if (cancelled) return;
          const Toss = window.TossPayments;
          if (!Toss) throw new Error("TossPayments 전역 객체 없음");
          // v2: TossPayments(clientKey) 후 .payment({ customerKey })
          const tossPayments = Toss(clientKey);
          paymentRef.current = tossPayments.payment({ customerKey });
          initKeyRef.current = key;
          setReadySafe(true);
        } catch {
          paymentRef.current = null;
          initKeyRef.current = "";
          setReadySafe(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [clientKey, customerKey, setReadySafe]);

    useImperativeHandle(
      ref,
      () => ({
        get ready() {
          return readyRef.current;
        },
        requestPayment: async (params) => {
          const payment = paymentRef.current;
          if (!payment || !readyRef.current) {
            throw new Error("TossPayments가 아직 준비되지 않았습니다.");
          }
          const oid = params.orderId?.trim();
          const oname = params.orderName?.trim();
          if (!oid || !oname) {
            throw new Error("주문번호·주문명이 필요합니다.");
          }
          const value = Math.floor(Number(params.amount));
          if (!Number.isFinite(value) || value < 1) {
            throw new Error("결제 금액이 올바르지 않습니다.");
          }
          const method = params.method ?? "CARD";
          await payment.requestPayment({
            method,
            amount: {
              currency: "KRW",
              value,
            },
            orderId: oid,
            orderName: oname,
            successUrl: absoluteUrl(successPath),
            failUrl: absoluteUrl(failPath),
            customerName: params.customerName,
            customerEmail: params.customerEmail,
            customerMobilePhone: params.customerMobilePhone,
            card: {
              useEscrow: false,
              useCardPoint: false,
              useAppCardOnly: false,
            },
          });
        },
      }),
      [successPath, failPath],
    );

    return null;
  },
);

TossPayment.displayName = "TossPayment";
