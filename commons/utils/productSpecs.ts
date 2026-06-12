import type { Json } from "@/types/supabase";

const DEFAULT_ORDER = [
  "제조사",
  "원산지",
  "수입·판매원",
  "KC 인증",
  "사용연령",
  "품질보증",
  "소재·성분",
  "구성품",
  "A/S",
  "유의사항",
] as const;

/** `products.additional_info` JSON 객체 → 표용 문자열 맵 */
export function parseAdditionalInfoObject(
  raw: Json | null | undefined,
): Record<string, string> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v == null) out[k] = "";
    else if (typeof v === "string") out[k] = v;
    else if (typeof v === "number" || typeof v === "boolean") {
      out[k] = String(v);
    } else {
      out[k] = JSON.stringify(v);
    }
  }
  return out;
}

/** 표시 순서: 기본 키 순서 우선, 나머지는 가나다순 */
export function orderedSpecEntries(
  specs: Record<string, string>,
): { label: string; value: string }[] {
  const keys = Object.keys(specs);
  if (keys.length === 0) return [];

  const orderSet = new Set<string>(DEFAULT_ORDER);
  const rest = keys.filter((k) => !orderSet.has(k));
  rest.sort((a, b) => a.localeCompare(b, "ko"));

  const orderedKeys = [
    ...DEFAULT_ORDER.filter((k) => k in specs),
    ...rest,
  ];

  return orderedKeys.map((label) => ({
    label,
    value: specs[label] ?? "",
  }));
}

/** @deprecated parseAdditionalInfoObject 사용 */
export const parseAdditionalInfoSpecs = parseAdditionalInfoObject;

export function defaultAdditionalInfoSpecs(productName: string): Record<string, string> {
  const brand = productName.trim().split(/\s+/)[0] || "공급사";
  return {
    제조사: `${brand} 공급사`,
    원산지: "대한민국",
    "수입·판매원": "Commerce Dashboard",
    "KC 인증": "해당 시 본체 표기 참조",
    사용연령: "만 14세 이상 권장",
    품질보증: "구매일 기준 1년(소비자 과실 제외)",
    "소재·성분": "제품 라벨 및 동봉 안내서 참조",
    구성품: "본체 및 패키지 구성은 모델별 상이",
    "A/S": "고객센터 평일 10:00–18:00",
    유의사항: "직사광선·고온 다습 보관을 피해 주세요.",
  };
}

/** 시드·백필용 세로형(640×1200) 상세 이미지 URL 풀 */
export const PORTRAIT_DETAIL_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&h=1200&fit=crop&crop=center&q=80&auto=format",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=640&h=1200&fit=crop&crop=center&q=80&auto=format",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=640&h=1200&fit=crop&crop=center&q=80&auto=format",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&h=1200&fit=crop&crop=center&q=80&auto=format",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=640&h=1200&fit=crop&crop=center&q=80&auto=format",
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=640&h=1200&fit=crop&crop=center&q=80&auto=format",
  "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=640&h=1200&fit=crop&crop=center&q=80&auto=format",
  "https://images.unsplash.com/photo-1617043786394-f977fa162edc?w=640&h=1200&fit=crop&crop=center&q=80&auto=format",
] as const;

export function pickPortraitDetailUrls(seed: string, count = 3): string[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const n = Math.abs(h);
  const pool = [...PORTRAIT_DETAIL_IMAGE_POOL];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pool[(n + i * 3) % pool.length] ?? pool[0] ?? "");
  }
  return [...new Set(out)].filter(Boolean);
}
