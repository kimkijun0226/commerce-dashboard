/** Keep supplier/model identifiers in the DB, out of customer-facing titles. */
export function getProductDisplayName(name: string): string {
  const cleaned = name.split(/[\s_]+/).filter((word) => {
    const token = word.replace(/[()[\],]/g, "");
    return !/^(?=.*[a-z])(?=.*\d)[a-z\d-]{6,}$/i.test(token) && !/^\d{5,}$/.test(token);
  }).join(" ").replace(/\[\s*\]|\(\s*\)/g, "").trim();
  return cleaned || name;
}

export function formatWon(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}
