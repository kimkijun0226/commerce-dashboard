export const salesLabels: Record<string, string> = {
  fashion: "의류",
  beauty: "뷰티",
  home: "홈",
  paid: "결제 완료",
  canceled: "취소",
  refunded: "환불",
  pending: "결제 대기",
  preparing: "배송 준비",
  shipped: "배송 중",
  delivered: "배송 완료",
  on_hold: "보류",
};
export function salesFilters(
  params: Record<string, string | string[] | undefined>,
) {
  const single = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const days = Number(single("days"));
  const date = single("date");
  const validDate =
    date >= "0001-01-01" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date)) &&
    new Date(date).toISOString().slice(0, 10) === date;
  return {
    days: [7, 30, 90].includes(days) ? days : 30,
    date: validDate ? date : "",
    department: ["fashion", "beauty", "home"].includes(single("department"))
      ? single("department")
      : "",
    view: ["products", "operations", "orders"].includes(single("view"))
      ? single("view")
      : "overview",
    page: Math.min(10000, Math.max(1, Math.floor(Number(single("page"))) || 1)),
    status: ["paid", "canceled", "refunded", "pending"].includes(
      single("status"),
    )
      ? single("status")
      : "",
  };
}
export type SalesGroup = { label: string; revenue: number; orders: number };
export type SalesRow = {
  id: string;
  ordered_at: string;
  product_id: string | null;
  product_name: string;
  department: string;
  quantity: number;
  gross_amount: number;
  discount_amount: number;
  status: string;
  fulfillment: string;
  channel: string;
  region: string;
  payment_method: string;
  returning_customer: boolean;
  net: number;
};
export type SalesData = {
  start: string;
  end: string;
  updatedAt: string;
  summary: {
    orders: number;
    paid: number;
    revenue: number;
    units: number;
    discount: number;
    refund: number;
    canceled: number;
    returning: number;
    pendingShipment: number;
  };
  previousRevenue: number;
  daily: { day: string; revenue: number; orders: number }[];
  products: {
    product_id: string | null;
    product_name: string;
    department: string;
    revenue: number;
    units: number | null;
    orders: number;
  }[];
  departments: SalesGroup[];
  channels: SalesGroup[];
  regions: SalesGroup[];
  payments: SalesGroup[];
  statuses: SalesGroup[];
  fulfillments: SalesGroup[];
  hours: SalesGroup[];
  total: number;
  rows: SalesRow[];
};
