function escapeIlike(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function quoteFilter(value: string) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

/** Spaces and customer hashtag markers do not change the searchable phrase. */
export function normalizeCatalogSearch(keyword: string): string {
  return keyword.toLowerCase().replace(/[\s#]/g, "");
}

/** Quote PostgREST values so punctuation cannot change the filter syntax. */
export function buildCatalogSearchFilter(keyword: string): string {
  const normalized = normalizeCatalogSearch(keyword);
  if (!normalized) return "";
  const match = (value: string) => `search_text.ilike.${quoteFilter(`%${escapeIlike(value)}%`)}`;
  const words = [...new Set(keyword.toLowerCase().split(/[\s#]+/).filter(Boolean))].slice(0, 10);
  return words.length > 1 ? `${match(normalized)},and(${words.map(match).join(",")})` : match(normalized);
}
