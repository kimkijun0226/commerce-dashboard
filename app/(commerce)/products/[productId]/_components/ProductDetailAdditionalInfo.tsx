function isAllowedImageUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  try {
    const u = new URL(t);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function dedupe(urls: string[]): string[] {
  return [...new Set(urls.map((u) => u.trim()))];
}

/**
 * `products.additional_info`에 저장된 이미지 주소 파싱.
 * - 줄바꿈 / 쉼표 / 세미콜론 / 파이프 구분
 * - JSON 배열 문자열 `["https://...","https://..."]`
 * - 그 외 본문 속 `http(s)://` 토큰
 */
export function parseAdditionalInfoImageUrls(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];

  if (t.startsWith("[")) {
    try {
      const parsed = JSON.parse(t) as unknown;
      if (Array.isArray(parsed)) {
        const out: string[] = [];
        for (const item of parsed) {
          if (typeof item === "string" && isAllowedImageUrl(item)) {
            out.push(item.trim());
          }
        }
        return dedupe(out);
      }
    } catch {
      /* fall through */
    }
  }

  const fromSplit = t
    .split(/[\n,;|]+/)
    .map((s) => s.trim())
    .filter(isAllowedImageUrl);

  if (fromSplit.length > 0) {
    return dedupe(fromSplit);
  }

  const matches = t.match(/https?:\/\/[^\s"'<>]+/gi);
  if (matches?.length) {
    return dedupe(matches.filter(isAllowedImageUrl));
  }

  return isAllowedImageUrl(t) ? [t.trim()] : [];
}

export type ProductDetailAdditionalInfoProps = {
  /** Supabase `products.additional_info` — 이미지 URL(들) */
  additionalInfo: string | null;
  /** 대체 텍스트 접두(상품명 등) */
  imageAltBase: string;
};

export function ProductDetailAdditionalInfo({
  additionalInfo,
  imageAltBase,
}: ProductDetailAdditionalInfoProps) {
  const urls = parseAdditionalInfoImageUrls(additionalInfo ?? "");

  if (urls.length === 0) {
    return (
      <p className="text-(--commerce-text-tertiary)">
        No detail images available.
      </p>
    );
  }

  return (
    <div className="flex w-full max-w-none flex-col gap-4 sm:gap-6">
      {urls.map((src, i) => (
        <figure key={`${src}-${i}`} className="m-0 overflow-hidden rounded-lg">
          <img
            src={src}
            alt={`${imageAltBase} — product detail ${i + 1}`}
            className="h-auto w-full object-cover object-top"
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </figure>
      ))}
    </div>
  );
}
