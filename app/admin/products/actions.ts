"use server";

import { parseOptionEditor } from "@/commons/utils/productOptions";
import { revalidatePath, updateTag } from "next/cache";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function saveProductKeywords(formData: FormData) {
  if (!(await checkAdminAccess())) throw new Error("관리자 권한이 필요합니다.");
  const id = String(formData.get("productId") ?? "");
  const raw = String(formData.get("keywords") ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error("올바른 상품 ID가 필요합니다.");
  }
  const keywords = [...new Set(raw.split(/[,\n]/).map((value) => value.trim()).filter(Boolean))];
  if (raw.length > 10000 || keywords.length > 50 || keywords.some((value) => value.length > 100)) {
    throw new Error("키워드는 최대 50개, 각 100자까지 입력할 수 있습니다.");
  }
  const options = formData.has("options") ? parseOptionEditor(String(formData.get("options") ?? "")) : undefined;
  const supabase = await createClient();
  const { data, error } = await supabase.from("products")
    .update({ search_keywords: keywords, ...(options ? { options: options.map((option) => ({ ...option })) } : {}) }).eq("id", id).select("id").single();
  if (error || !data) throw new Error(`검색 키워드 저장 실패: ${error?.message ?? "상품이 없습니다."}`);
  updateTag("catalog");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}
