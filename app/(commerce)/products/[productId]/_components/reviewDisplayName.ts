const FIRST = [
  "Sofia",
  "Nicolas",
  "Alex",
  "Taylor",
  "Jordan",
  "Casey",
  "Riley",
  "Morgan",
] as const;
const LAST = [
  "Harvetz",
  "Jensen",
  "Kim",
  "Brooks",
  "Reed",
  "Patel",
  "Chen",
  "Walsh",
] as const;

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Figma 리뷰 카드용 표시 이름(익명, 결정적) */
export function reviewDisplayName(reviewId: string): string {
  const h = hashId(reviewId);
  const f = FIRST[h % FIRST.length];
  const l = LAST[(h >> 4) % LAST.length];
  return `${f} ${l}`;
}

/** 아바타 이니셜 (라틴 이름 기준) */
export function reviewDisplayInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0] ?? "";
    const b = parts[parts.length - 1][0] ?? "";
    return `${a}${b}`.toUpperCase();
  }
  return displayName.slice(0, 2).toUpperCase() || "?";
}
