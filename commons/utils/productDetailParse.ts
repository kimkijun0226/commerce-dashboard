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
 * `products.additional_info` 등에 저장된 이미지 주소 파싱.
 * - 줄바꿈 / 쉼표 / 세미콜론 / 파이프 구분
 * - JSON 배열 문자열
 * - 본문 속 `http(s)://` 토큰
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

/** 추가정보 탭: 이미지 URL 줄·토큰은 제외한 본문만 */
export function additionalInfoPlainText(raw: string | null): string {
  if (!raw?.trim()) return "";
  const urlSet = new Set(
    parseAdditionalInfoImageUrls(raw).map((u) => u.toLowerCase()),
  );
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      const lower = line.toLowerCase();
      if (urlSet.has(lower)) return false;
      if (/^https?:\/\//i.test(line)) return false;
      return true;
    })
    .join("\n\n")
    .trim();
}

/** measurements 텍스트를 라벨/값 표 행으로 파싱 (콜론 구분 우선) */
export function parseMeasurementRows(
  measurements: string | null,
): { label: string; value: string }[] {
  if (!measurements?.trim()) return [];
  const lines = measurements
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const rows: { label: string; value: string }[] = [];
  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon > 0) {
      rows.push({
        label: line.slice(0, colon).trim(),
        value: line.slice(colon + 1).trim(),
      });
    } else {
      rows.push({ label: "", value: line });
    }
  }
  return rows;
}
