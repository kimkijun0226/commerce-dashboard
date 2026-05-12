import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  OrderStatus,
  PaymentStatusOrder,
  PaymentStatusPayment,
} from "@/types/supabase";

export type OrderDetailItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  unitSalePrice: number | null;
  productName: string | null;
  productImageUrl: string | null;
  lineSubtotal: number;
};

export type OrderDetailPayment = {
  id: string;
  provider: string;
  method: string;
  amount: number;
  currency: string;
  status: PaymentStatusPayment;
  transactionId: string | null;
  createdAt: string;
  approvedAt: string | null;
};

export type OrderDetailOrder = {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatusOrder;
  totalAmount: number;
  subtotalAmount: number;
  shippingFee: number;
  discountAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  tossOrderId: string | null;
};

export type OrderDetail = {
  order: OrderDetailOrder;
  items: OrderDetailItem[];
  payment: OrderDetailPayment | null;
};

type OrdersRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemsRow = Database["public"]["Tables"]["order_items"]["Row"];
type PaymentsRow = Database["public"]["Tables"]["payments"]["Row"];

function mapOrder(row: OrdersRow): OrderDetailOrder {
  return {
    id: row.id,
    status: row.status,
    paymentStatus: row.payment_status,
    totalAmount: Number(row.total_amount),
    subtotalAmount: Number(row.subtotal_amount),
    shippingFee: Number(row.shipping_fee),
    discountAmount: Number(row.discount_amount),
    currency: row.currency ?? "KRW",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    shippingName: row.shipping_name,
    shippingPhone: row.shipping_phone,
    shippingAddressLine1: row.shipping_address_line1,
    shippingAddressLine2: row.shipping_address_line2,
    shippingCity: row.shipping_city,
    shippingState: row.shipping_state,
    shippingZip: row.shipping_zip,
    shippingCountry: row.shipping_country,
    tossOrderId: row.toss_order_id,
  };
}

function mapItem(row: OrderItemsRow): OrderDetailItem {
  return {
    id: row.id,
    productId: row.product_id,
    quantity: Math.max(1, Number(row.quantity) || 1),
    unitPrice: Number(row.unit_price),
    unitSalePrice: row.unit_sale_price == null ? null : Number(row.unit_sale_price),
    productName: row.product_name,
    productImageUrl: row.product_image_url,
    lineSubtotal: Number(row.line_subtotal),
  };
}

function mapPayment(row: PaymentsRow): OrderDetailPayment {
  return {
    id: row.id,
    provider: row.provider,
    method: row.method,
    amount: Number(row.amount),
    currency: row.currency ?? "KRW",
    status: row.status,
    transactionId: row.transaction_id,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
  };
}

/**
 * 로그인 사용자 본인 주문만 조회합니다.
 * 주문이 없거나 user_id가 다르면 null → 호출부에서 notFound().
 */
export async function getOrderDetail(
  supabase: SupabaseClient<Database>,
  userId: string,
  orderId: string,
): Promise<OrderDetail | null> {
  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (orderErr || !orderRow) return null;

  const orderTyped = orderRow as OrdersRow;

  const { data: itemRows, error: itemsErr } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("id", { ascending: true });

  if (itemsErr) return null;

  const { data: paymentRows, error: payErr } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1);

  if (payErr) return null;

  const paymentRow = paymentRows?.[0] ?? null;

  return {
    order: mapOrder(orderTyped),
    items: ((itemRows ?? []) as OrderItemsRow[]).map(mapItem),
    payment: paymentRow ? mapPayment(paymentRow as PaymentsRow) : null,
  };
}
