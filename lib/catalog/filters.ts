function escapeIlike(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function quoteFilter(value: string) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

/** Keep in sync with public.normalize_product_search in migration 0025. */
export function normalizeCatalogSearch(keyword: string): string {
  return keyword.toLowerCase().replace(/\s/g, "");
}

/** Quote PostgREST values so punctuation cannot change the filter syntax. */
export function buildCatalogSearchFilter(keyword: string): string {
  const normalized = normalizeCatalogSearch(keyword);
  if (!normalized) return "";
  return `search_text.ilike.${quoteFilter(`%${escapeIlike(normalized)}%`)}`;
}
