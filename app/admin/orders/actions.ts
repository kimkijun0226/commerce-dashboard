"use server";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { readFulfillmentForm } from "@/lib/admin/validation";
import { revalidatePath } from "next/cache";
export async function saveFulfillment(
  _state: { error?: string; saved?: boolean },
  form: FormData,
): Promise<{ error?: string; saved?: boolean }> {
  if (!(await checkAdminAccess()))
    return { error: "관리자 권한이 필요합니다." };
  try {
    const id = String(form.get("orderId") ?? "");
    const portfolio = /^SIM-\d{8}-\d{4}$/.test(id);
    if (portfolio) {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("get_admin_portfolio_order", {
        p_id: id,
      });
      const order = data as {
        status: string;
        fulfillment: string;
        updated_at: string;
      } | null;
      if (error || !order) throw new Error("주문을 찾을 수 없습니다.");
      if (String(form.get("updatedAt")) !== order.updated_at)
        throw new Error(
          "다른 곳에서 주문이 변경되었습니다. 새로고침해 주세요.",
        );
      const values = readFulfillmentForm(
        form,
        order.status === "paid",
        order.fulfillment,
      );
      const saved = await supabase.rpc("save_portfolio_fulfillment", {
        p_id: id,
        p_updated_at: order.updated_at,
        p_status: values.fulfillment_status,
        p_carrier: values.shipping_carrier ?? "",
        p_tracking: values.tracking_number ?? "",
      });
      if (saved.error || !saved.data)
        throw new Error("배송 저장 실패. 주문 상태를 새로고침해 주세요.");
      revalidatePath("/admin", "layout");
      return { saved: true };
    }
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    )
      throw new Error("올바른 주문을 선택해 주세요.");
    const supabase = await createClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("status,payment_status,fulfillment_status,shipped_at,updated_at")
      .eq("id", id)
      .single();
    if (error || !order) throw new Error("주문을 찾을 수 없습니다.");
    if (String(form.get("updatedAt")) !== order.updated_at)
      throw new Error(
        "다른 곳에서 주문이 변경되었습니다. 새로고침 후 다시 확인해 주세요.",
      );
    const paid = order.status === "paid" && order.payment_status === "success";
    const values = readFulfillmentForm(form, paid, order.fulfillment_status);
    let query = supabase
      .from("orders")
      .update({
        ...values,
        shipped_at: ["shipped", "delivered"].includes(values.fulfillment_status)
          ? (order.shipped_at ?? new Date().toISOString())
          : order.shipped_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("updated_at", order.updated_at);
    if (!["unfulfilled", "on_hold"].includes(values.fulfillment_status))
      query = query.eq("status", "paid").eq("payment_status", "success");
    const result = await query.select("id").single();
    if (result.error || !result.data)
      throw new Error("배송 저장 실패. 주문 상태를 새로고침해 주세요.");
    revalidatePath("/admin", "layout");
    revalidatePath(`/account/orders/${id}`);
    revalidatePath("/account/orders");
    return { saved: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "배송 정보를 저장하지 못했습니다.",
    };
  }
}
