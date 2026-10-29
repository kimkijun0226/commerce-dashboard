export type ProductOption = { name: string; values: string[]; required?: boolean };

export function parseProductOptions(raw: unknown): ProductOption[] {
  if (!Array.isArray(raw)) return [];
  const names = new Set<string>();
  return raw.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || typeof entry.name !== "string" || !Array.isArray(entry.values)) return [];
    const name = entry.name.trim();
    const values = [...new Set<string>(entry.values.filter((v: unknown): v is string => typeof v === "string").map((v: string) => v.trim()).filter(Boolean))];
    if (!name || !values.length || names.has(name)) return [];
    names.add(name);
    return [{ name, values, required: entry.required !== false }];
  });
}

export function validateSelectedOptions(options: ProductOption[], selected: unknown): Record<string, string> {
  if (selected == null) selected = {};
  if (typeof selected !== "object" || Array.isArray(selected)) throw new Error("상품 옵션을 확인해 주세요.");
  const entries = Object.entries(selected as Record<string, unknown>);
  for (const [name, value] of entries) {
    const option = options.find((o) => o.name === name);
    if (!option || typeof value !== "string" || !option.values.includes(value)) throw new Error(`${name}: 올바른 옵션을 선택해 주세요.`);
  }
  for (const option of options) {
    if (option.required !== false && !entries.some(([name]) => name === option.name)) throw new Error(`${option.name} 옵션을 선택해 주세요.`);
  }
  return Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b))) as Record<string, string>;
}

export function getCartItemKey(item: { id: string; selectedOptions?: Record<string, string> }): string {
  const entries = Object.entries(item.selectedOptions ?? {}).sort(([a], [b]) => a.localeCompare(b));
  return entries.length ? `${item.id}:${JSON.stringify(entries)}` : item.id;
}

export function formatSelectedOptions(selected: unknown): string {
  if (!selected || typeof selected !== "object" || Array.isArray(selected)) return "";
  return Object.entries(selected).filter(([, value]) => typeof value === "string").map(([name, value]) => `${name}: ${value}`).join(" / ");
}

/** Seller input: one group per line, e.g. 사이즈: S, M, L. */
export function parseOptionEditor(raw: string): ProductOption[] {
  if (raw.length > 5000) throw new Error("옵션 입력은 5,000자까지 가능합니다.");
  const groups = raw.split(/\n/).map((line) => line.trim()).filter(Boolean);
  if (groups.length > 10) throw new Error("옵션은 최대 10개까지 등록할 수 있습니다.");
  const names = new Set<string>();
  return groups.map((line) => {
    const separator = line.indexOf(":");
    if (separator < 1) throw new Error("옵션은 '사이즈: S, M, L' 형식으로 입력해 주세요.");
    const rawName = line.slice(0, separator).trim();
    const required = !rawName.endsWith("?");
    const name = rawName.replace(/\?$/, "").trim();
    const values = [...new Set(line.slice(separator + 1).split(",").map((v) => v.trim()).filter(Boolean))];
    if (!name || name.length > 50 || names.has(name) || values.length === 0 || values.length > 30 || values.some((v) => v.length > 100)) {
      throw new Error("옵션명은 중복 없이 50자, 옵션값은 1~30개까지 입력해 주세요.");
    }
    names.add(name);
    return { name, values, required };
  });
}
