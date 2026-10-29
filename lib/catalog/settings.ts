import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { defaultCampaigns, type CampaignBanner } from "./campaigns";
import type { StoreKey } from "./storefront";
const allSettings = unstable_cache(
  async () => {
    const { data, error } = await createPublicClient()
      .from("store_settings")
      .select("department,logo_url,banners");
    if (error) throw new Error(`매장 설정 조회 실패: ${error.message}`);
    return data;
  },
  ["store-settings"],
  { revalidate: 30, tags: ["store-settings"] },
);
function storeLogo(url: string | null | undefined) {
  return !url || url === "/brand/oveon-logo.svg"
    ? "/brand/revie-logo.svg"
    : url;
}
export async function getStoreSettings(store: StoreKey) {
  const row = (await allSettings()).find((row) => row.department === store);
  return {
    logoUrl: storeLogo(row?.logo_url),
    banners:
      Array.isArray(row?.banners) && row.banners.length
        ? (row.banners as unknown as CampaignBanner[])
        : defaultCampaigns(store),
  };
}
export async function getStoreLogos() {
  const rows = await allSettings();
  return Object.fromEntries(
    rows.map((row) => [row.department, storeLogo(row.logo_url)]),
  );
}
