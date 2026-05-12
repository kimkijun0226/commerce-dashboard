"use client";

import Link from "next/link";
import { useMemo } from "react";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { ACCOUNT_ORDER_URLS, ACCOUNT_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { cn, typographyToStyle } from "@/components/ui";
import { AccountPagination } from "@/components/account/AccountPagination";

export type OrdersTableRow = {
  id: string;
  createdAt: string;
  status: "pending" | "paid" | "canceled" | "refunded";
  paymentStatus: "requested" | "success" | "failed" | "refund_requested" | "refund_completed";
  totalAmount: number;
  currency: string;
  /** 대표 상품명(주문 첫 상품) */
  primaryItemName?: string | null;
  /** 주문에 포함된 서로 다른 상품 종류 수 */
  distinctItemCount?: number;
  /** 전체 상품 수량 합 */
  totalQuantity?: number;
};

function formatKrw(n: number) {
  return `${Math.round(Number(n)).toLocaleString("ko-KR")}원`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ko-KR");
}

function orderCode(id: string) {
  const s = String(id);
  // uuid의 마지막 8자리 정도만 보여주기
  return `#${s.replace(/-/g, "").slice(-8).toUpperCase()}`;
}

function orderTitle(row: OrdersTableRow) {
  const name = row.primaryItemName?.trim();
  const kinds = Math.max(0, Number(row.distinctItemCount ?? 0));
  if (!name) return "주문 상품";
  if (kinds <= 1) return name;
  return `${name} 외 ${kinds - 1}개 상품`;
}

function statusLabel(row: Pick<OrdersTableRow, "status" | "paymentStatus">) {
  // 한글 표기 (요구사항)
  if (row.status === "paid" && row.paymentStatus === "success") return "결제완료";
  if (row.status === "pending") return "결제대기";
  if (row.status === "canceled") return "취소";
  if (row.status === "refunded") return "환불";
  if (row.paymentStatus === "failed") return "결제실패";
  return "처리중";
}

function statusColor(label: string) {
  if (label === "결제완료") return { bg: "rgba(56,203,137,0.12)", fg: commerceColors.semantic.success };
  if (label === "결제대기") return { bg: "rgba(255,171,0,0.14)", fg: commerceColors.semantic.warning };
  if (label === "취소" || label === "결제실패") return { bg: "rgba(255,86,48,0.12)", fg: commerceColors.semantic.danger };
  if (label === "환불") return { bg: "rgba(55,125,255,0.12)", fg: commerceColors.semantic.info };
  return { bg: commerceColors.background.light, fg: commerceColors.text.secondary };
}

export function OrdersTable({
  rows,
  page,
  totalPages,
}: {
  rows: readonly OrdersTableRow[];
  page: number;
  totalPages: number;
}) {
  const empty = rows.length === 0;

  const headerStyle = useMemo(
    () => ({
      ...typographyToStyle(commerceTypography.caption1Semi),
      color: commerceColors.text.secondary,
    }),
    [],
  );

  return (
    <section aria-label="주문 목록">
      <div
        className={cn("w-full overflow-hidden rounded-lg border bg-white")}
        style={{ borderColor: commerceColors.border.subtle }}
      >
        {/* Desktop header */}
        <div
          className="hidden grid-cols-[minmax(0,1fr)_140px_140px] gap-6 border-b px-6 py-4 md:grid"
          style={{ borderColor: commerceColors.border.subtle, ...headerStyle }}
        >
          <div>주문</div>
          <div className="text-center">상태</div>
          <div className="text-right">금액</div>
        </div>

        {empty ? (
          <div className="px-4 py-12 text-center sm:px-6">
            <p style={{ ...typographyToStyle(commerceTypography.body2Semi), color: commerceColors.text.primary }}>
              주문 내역이 없습니다.
            </p>
            <p className="mt-2" style={{ ...typographyToStyle(commerceTypography.body2), color: commerceColors.text.secondary }}>
              상품을 담고 주문을 완료해 보세요.
            </p>
            <Link
              href={COMMERCE_URLS.PRODUCTS}
              className="mt-6 inline-flex items-center justify-center rounded-[80px] bg-(--commerce-primary-main) px-6 py-3 text-white"
              style={typographyToStyle(commerceTypography.buttonS)}
              aria-label="상품 보러가기"
            >
              상품 보러가기
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop rows */}
            <ul className="hidden divide-y md:block" style={{ borderColor: commerceColors.border.subtle }}>
              {rows.map((o) => {
                const label = statusLabel(o);
                const colors = statusColor(label);
                const totalQty = Math.max(0, Number(o.totalQuantity ?? 0));
                return (
                  <li key={o.id}>
                    <Link
                      href={ACCOUNT_ORDER_URLS.DETAIL(o.id)}
                      className={cn(
                        "grid grid-cols-[minmax(0,1fr)_140px_140px] items-start gap-6 px-6 py-5 transition-colors",
                        "hover:bg-(--commerce-background-light)",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
                      )}
                      aria-label={`주문 상세로 이동: ${orderCode(o.id)}`}
                    >
                      <div className="min-w-0">
                        <div
                          className="truncate"
                          style={{
                            ...typographyToStyle(commerceTypography.body2Semi),
                            color: commerceColors.text.primary,
                          }}
                        >
                          {orderTitle(o)}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span
                            className="whitespace-nowrap"
                            style={{
                              ...typographyToStyle(commerceTypography.caption1Semi),
                              color: commerceColors.text.secondary,
                            }}
                          >
                            {orderCode(o.id)}
                          </span>
                          <span
                            aria-hidden
                            className="whitespace-nowrap"
                            style={{
                              color: commerceColors.border.subtle,
                            }}
                          >
                            ·
                          </span>
                          <span
                            className="whitespace-nowrap"
                            style={{
                              ...typographyToStyle(commerceTypography.caption1),
                              color: commerceColors.text.secondary,
                            }}
                          >
                            {formatDate(o.createdAt)}
                          </span>
                          {totalQty > 0 ? (
                            <>
                              <span aria-hidden className="whitespace-nowrap" style={{ color: commerceColors.border.subtle }}>
                                ·
                              </span>
                              <span
                                className="whitespace-nowrap"
                                style={{
                                  ...typographyToStyle(commerceTypography.caption1),
                                  color: commerceColors.text.secondary,
                                }}
                              >
                                총 {totalQty}개
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <span
                          className="inline-flex min-w-[92px] justify-center rounded-full px-3 py-1 text-[12px] font-semibold leading-4"
                          style={{ backgroundColor: colors.bg, color: colors.fg }}
                        >
                          {label}
                        </span>
                      </div>

                      <div className="text-right" style={{ ...typographyToStyle(commerceTypography.body2Semi), color: commerceColors.text.primary }}>
                        {formatKrw(o.totalAmount)}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile cards */}
            <ul className="divide-y md:hidden" style={{ borderColor: commerceColors.border.subtle }}>
              {rows.map((o) => {
                const label = statusLabel(o);
                const colors = statusColor(label);
                const totalQty = Math.max(0, Number(o.totalQuantity ?? 0));
                return (
                  <li key={o.id}>
                    <Link
                      href={ACCOUNT_ORDER_URLS.DETAIL(o.id)}
                      className={cn(
                        "block px-4 py-5 transition-colors",
                        "hover:bg-(--commerce-background-light)",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--commerce-semantic-info)",
                      )}
                      aria-label={`주문 상세로 이동: ${orderCode(o.id)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div
                            className="truncate"
                            style={{
                              ...typographyToStyle(commerceTypography.body2Semi),
                              color: commerceColors.text.primary,
                            }}
                          >
                            {orderTitle(o)}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1" style={{ ...typographyToStyle(commerceTypography.caption1), color: commerceColors.text.secondary }}>
                            <span className="whitespace-nowrap">{orderCode(o.id)}</span>
                            <span aria-hidden style={{ color: commerceColors.border.subtle }}>·</span>
                            <span className="whitespace-nowrap">{formatDate(o.createdAt)}</span>
                            {totalQty > 0 ? (
                              <>
                                <span aria-hidden style={{ color: commerceColors.border.subtle }}>·</span>
                                <span className="whitespace-nowrap">총 {totalQty}개</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold leading-4"
                          style={{ backgroundColor: colors.bg, color: colors.fg }}
                        >
                          {label}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-end">
                        <div style={{ ...typographyToStyle(commerceTypography.body2Semi), color: commerceColors.text.primary }}>
                          {formatKrw(o.totalAmount)}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className="mt-10">
        <AccountPagination page={page} totalPages={totalPages} basePath={ACCOUNT_URLS.ORDERS} />
      </div>
    </section>
  );
}

