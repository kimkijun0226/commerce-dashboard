/** Multi-word phrases remain one tag; hashes, commas and newlines separate tags. */
export function parseSearchKeywords(raw: string): string[] {
  const keywords = [
    ...new Set(
      raw
        .split(/[,\n#]+/)
        .map((value) => value.trim().replace(/\s+/g, " "))
        .filter(Boolean),
    ),
  ];
  if (
    raw.length > 10000 ||
    keywords.length > 50 ||
    keywords.some((value) => value.length > 100)
  ) {
    throw new Error("검색 태그는 최대 50개, 각 100자까지 입력할 수 있습니다.");
  }
  return keywords;
}
