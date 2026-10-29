"use server";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/admin/validation";
import { readStoreBanners } from "@/lib/admin/storeSettings";
import { revalidatePath, updateTag } from "next/cache";
export async function saveStoreSettings(
  _state: { error?: string; saved?: boolean; savedAt?: string },
  form: FormData,
): Promise<{ error?: string; saved?: boolean; savedAt?: string }> {
  if (!(await checkAdminAccess()))
    return { error: "관리자 권한이 필요합니다." };
  try {
    const department = String(form.get("department"));
    if (!["fashion", "beauty", "home"].includes(department))
      throw new Error("매장을 선택해 주세요.");
    const logo_url = imageUrl(String(form.get("logoUrl") ?? ""), true);
    const banners = readStoreBanners(String(form.get("banners") ?? ""));
    const supabase = await createClient();
    const { error } = await supabase
      .from("store_settings")
      .upsert({
        department,
        logo_url,
        banners: banners.map((b) => ({ ...b })),
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error(error.message);
    updateTag("store-settings");
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { saved: true, savedAt: new Date().toISOString() };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "설정을 저장하지 못했습니다.",
    };
  }
}
