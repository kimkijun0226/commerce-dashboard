"use server";

import { revalidatePath } from "next/cache";
import { checkoutMessages } from "@/commons/constants/checkoutMessages";
import { createClient } from "@/lib/supabase/server";
import { normalizeMoney } from "@/lib/commerce/pricing";
import type { Json } from "@/types/supabase";

function tossBasicAuthHeader() {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) throw new Error("TOSS_SECRET_KEY가 설정되지 않았습니다.");
  const token = Buffer.from(`${secret}:`, "utf8").toString("base64");
  return `Basic ${token}`;
}

/** 이번 요청에서 토스 승인·DB 반영까지 새로 끝난 경우 */
export type TossConfirmPhasePaymentCompleted = "payment_completed";
/** 주문이 이미 paid(결제 반영됨) — 재방문·중복 승인 요청 등 */
export type TossConfirmPhaseOrderProcessing = "order_processing";

export type TossConfirmResult =
  | {
      ok: true;
      phase: TossConfirmPhasePaymentCompleted;
      message: string;
      data: Record<string, unknown>;
    }
  | {
      ok: true;
      phase: TossConfirmPhaseOrderProcessing;
      message: string;
      data: Record<string, unknown>;
    }
  | { ok: false; message: string; data: Record<string, unknown> };

export type MarkTossPaymentFailedResult = {
  message: string;
  /** 화면 분류용 (문구와 함께 표시 가능) */
  orderStatus?: "pending" | "paid" | "canceled";
  skipped?: boolean;
  updated?: boolean;
  orderId?: string;
  tossOrderId?: string;
  tossCode?: string;
  tossMessage?: string | null;
  query?: Record<string, string | null | undefined>;
  error?: string;
  reason?: string;
};

export async function confirmTossPayment(args: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossConfirmResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return {
      ok: false,
      message: checkoutMessages.loginRequired,
      data: { error: "AUTH" },
    };
  }

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id,user_id,status,payment_status,total_amount,toss_order_id")
    .eq("toss_order_id", args.orderId)
    .maybeSingle();

  if (orderErr || !order) {
    return {
      ok: false,
      message: checkoutMessages.orderNotFound,
      data: { error: "ORDER_NOT_FOUND", detail: orderErr?.message },
    };
  }
  if (order.user_id !== user.id) {
    return {
      ok: false,
      message: checkoutMessages.orderAccessDenied,
      data: { error: "FORBIDDEN" },
    };
  }

  const expected = normalizeMoney(Number(order.total_amount));
  const got = normalizeMoney(args.amount);
  if (expected !== got) {
    return {
      ok: false,
      message: checkoutMessages.amountMismatch,
      data: {
        error: "AMOUNT_MISMATCH",
        orderStatus: order.status,
        payment_status: order.payment_status,
        expected,
        got,
      },
    };
  }

  if (order.status === "paid" && order.payment_status === "success") {
    return {
      ok: true,
      // 결제 성공 화면에서는 paid 재방문/중복 호출이어도 "결제 완료"로 보여준다.
      phase: "payment_completed",
      message: checkoutMessages.paymentCompleted,
      data: {
        orderId: order.id,
        ordersStatus: "paid",
        payment_status: "success",
        note: "ALREADY_PAID",
      },
    };
  }

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: tossBasicAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentKey: args.paymentKey,
      orderId: args.orderId,
      amount: Math.floor(args.amount),
    }),
  });

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const errCode = String(body.code ?? "");
    if (errCode === "ALREADY_PROCESSED_PAYMENT") {
      const { data: refreshed } = await supabase
        .from("orders")
        .select("id,status,payment_status")
        .eq("toss_order_id", args.orderId)
        .maybeSingle();
      if (refreshed?.status === "paid" && refreshed.payment_status === "success") {
        return {
          ok: true,
          phase: "payment_completed",
          message: checkoutMessages.paymentCompleted,
          data: {
            orderId: refreshed.id,
            ordersStatus: "paid",
            payment_status: "success",
            tossCode: errCode,
            note: "ALREADY_PROCESSED_PAYMENT",
          },
        };
      }
    }
    return {
      ok: false,
      message: checkoutMessages.paymentConfirmFailed,
      data: {
        error: "TOSS_CONFIRM_FAILED",
        orderStatus: order.status,
        payment_status: order.payment_status,
        status: res.status,
        ...body,
      },
    };
  }

  const paymentKey = String(body.paymentKey ?? args.paymentKey);
  const approvedAt = typeof body.approvedAt === "string" ? body.approvedAt : new Date().toISOString();

  const { data: payRows, error: paySelErr } = await supabase
    .from("payments")
    .select("id,status")
    .eq("order_id", order.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (paySelErr || !payRows?.length) {
    return {
      ok: false,
      message: checkoutMessages.paymentRecordNotFound,
      data: { error: "PAYMENT_ROW_MISSING", detail: paySelErr?.message },
    };
  }

  const payId = payRows[0]!.id;

  const { error: payUpdErr } = await supabase
    .from("payments")
    .update({
      status: "succeeded",
      payment_key: paymentKey,
      transaction_id: typeof body.transactionKey === "string" ? body.transactionKey : paymentKey,
      raw_payload: body as unknown as Json,
      approved_at: approvedAt,
    })
    .eq("id", payId)
    .eq("user_id", user.id);

  if (payUpdErr) {
    return {
      ok: false,
      message: checkoutMessages.paymentSaveFailed,
      data: { error: "PAYMENT_UPDATE_FAILED", detail: payUpdErr.message },
    };
  }

  const { error: ordUpdErr } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_status: "success",
      paid_at: approvedAt,
    })
    .eq("id", order.id)
    .eq("user_id", user.id);

  if (ordUpdErr) {
    return {
      ok: false,
      message: checkoutMessages.orderSaveFailed,
      data: { error: "ORDER_UPDATE_FAILED", detail: ordUpdErr.message },
    };
  }

  // 결제가 승인된 이후에만 장바구니를 비운다 (취소/실패 시 상품이 날아가지 않도록)
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  revalidatePath("/checkout");
  revalidatePath("/cart");

  return {
    ok: true,
    phase: "payment_completed",
    message: checkoutMessages.paymentCompleted,
    data: {
      orderId: order.id,
      ordersStatus: "paid",
      payment_status: "success",
      toss: body,
    },
  };
}

export async function markTossPaymentFailed(args: {
  tossOrderId?: string | null;
  code?: string | null;
  message?: string | null;
}): Promise<MarkTossPaymentFailedResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      message: checkoutMessages.loginRequired,
      error: "AUTH",
      query: args,
    };
  }

  const tossOrderId = args.tossOrderId?.trim();
  if (!tossOrderId) {
    return {
      message: checkoutMessages.paymentCancelledOrIncomplete,
      skipped: true,
      orderStatus: "pending",
      reason: "NO_ORDER_ID",
      query: args,
    };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id,user_id,status,payment_status")
    .eq("toss_order_id", tossOrderId)
    .maybeSingle();

  if (!order || order.user_id !== user.id) {
    return {
      message: checkoutMessages.orderNotFound,
      error: "ORDER_NOT_FOUND",
      tossOrderId,
    };
  }

  if (order.status === "paid") {
    return {
      message: checkoutMessages.orderPaidProcessing,
      skipped: true,
      orderStatus: "paid",
      orderId: order.id,
    };
  }
  if (order.status === "canceled") {
    return {
      message: checkoutMessages.orderCanceled,
      skipped: true,
      orderStatus: "canceled",
      orderId: order.id,
    };
  }

  const isUserCanceled = args.code === "PAY_PROCESS_CANCELED";
  const nextPaymentStatus = isUserCanceled ? "cancelled" : "failed";

  await supabase
    .from("payments")
    .update({
      status: nextPaymentStatus,
      raw_payload: {
        source: "toss_fail_redirect",
        code: args.code ?? null,
        message: args.message ?? null,
      } satisfies Json,
    })
    .eq("order_id", order.id)
    .eq("user_id", user.id)
    .eq("status", "pending");

  await supabase
    .from("orders")
    .update({
      // 취소/실패 시 결제 진행은 종료되므로 pending으로 남기지 않는다.
      status: "canceled",
      payment_status: "failed",
    })
    .eq("id", order.id)
    .eq("user_id", user.id);

  revalidatePath("/checkout");

  return {
    message: checkoutMessages.orderCanceled,
    updated: true,
    orderStatus: "pending",
    orderId: order.id,
    tossCode: args.code ?? undefined,
    tossMessage: args.message ?? undefined,
    query: args,
  };
}
