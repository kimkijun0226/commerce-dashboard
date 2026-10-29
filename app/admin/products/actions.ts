"use server";
import { revalidatePath, updateTag } from "next/cache";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { readProductForm } from "@/lib/admin/validation";
import { redirect } from "next/navigation";
export type ProductSaveState = { error?: string };
export async function saveProduct(
  _state: ProductSaveState,
  form: FormData,
): Promise<ProductSaveState> {
  if (!(await checkAdminAccess()))
    return { error: "관리자 권한이 필요합니다." };
  let savedId: string;
  try {
    const id = String(form.get("productId") ?? "");
    if (
      id &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    )
      throw new Error("올바른 상품을 선택해 주세요.");
    const { brand, ...values } = readProductForm(form);
    const supabase = await createClient();
    let additional: Record<
      string,
      import("@/types/supabase").Json | undefined
    > = {};
    if (id) {
      const { data, error } = await supabase
        .from("products")
        .select("additional_info")
        .eq("id", id)
        .single();
      if (error || !data) throw new Error("상품을 찾을 수 없습니다.");
      if (
        data.additional_info &&
        typeof data.additional_info === "object" &&
        !Array.isArray(data.additional_info)
      )
        additional = data.additional_info;
    }
    const row = {
      ...values,
      additional_info: { ...additional, 브랜드: brand },
      updated_at: new Date().toISOString(),
    };
    const result = id
      ? await supabase
          .from("products")
          .update(row)
          .eq("id", id)
          .select("id")
          .single()
      : await supabase.from("products").insert(row).select("id").single();
    if (result.error || !result.data)
      throw new Error(
        result.error?.message ?? "저장한 상품을 확인할 수 없습니다.",
      );
    savedId = result.data.id;
    updateTag("catalog");
    revalidatePath("/admin", "layout");
    revalidatePath("/", "layout");
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "상품을 저장하지 못했습니다.",
    };
  }
  redirect(`/admin/products/${savedId}?saved=1`);
}
