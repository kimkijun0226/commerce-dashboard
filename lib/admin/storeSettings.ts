import { imageUrl } from "./validation";
import type { CampaignBanner } from "@/lib/catalog/campaigns";
export function readStoreBanners(raw: string): CampaignBanner[] {
  if (raw.length > 60000) throw new Error("배너 설정이 너무 큽니다.");
  let rows: unknown;
  try {
    rows = JSON.parse(raw);
  } catch {
    throw new Error("배너 설정 형식이 올바르지 않습니다.");
  }
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 10)
    throw new Error("배너는 1~10개까지 설정할 수 있습니다.");
  return rows.map((row) => {
    if (!row || typeof row !== "object")
      throw new Error("배너를 확인해 주세요.");
    const item = row as Record<string, unknown>;
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const description =
      typeof item.description === "string" ? item.description.trim() : "";
    const category =
      typeof item.category === "string" ? item.category.trim() : "";
    const q = typeof item.q === "string" ? item.q.trim() : "";
    if (
      !title ||
      title.length > 60 ||
      description.length > 140 ||
      category.length > 50 ||
      q.length > 200 ||
      typeof item.enabled !== "boolean"
    )
      throw new Error(
        "제목은 1~60자, 보조 문구는 140자, 검색어는 200자까지 입력해 주세요.",
      );
    return {
      title,
      description,
      category,
      q,
      enabled: item.enabled,
      imageUrl: imageUrl(String(item.imageUrl ?? ""), true),
    };
  });
}
