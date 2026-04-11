/**
 * Supabase Management API — POST /v1/projects/{ref}/database/query
 * @see https://supabase.com/docs/reference/api/introduction
 */

export function getProjectRefFromSupabaseUrl(url: string): string | null {
  const m = url?.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return m ? m[1] : null;
}

export async function managementDbExec(
  accessToken: string,
  projectRef: string,
  sql: string,
  readOnly = false,
): Promise<unknown> {
  const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query: sql, read_only: readOnly }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `HTTP ${response.status}`);
  }
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/** SELECT 한 컬럼(문자열) 목록으로 파싱 — 응답 형식이 버전마다 달라서 여러 형태 지원 */
export function parseSelectStringColumn(data: unknown, column = "name"): string[] {
  if (!data || typeof data !== "object") return [];
  const o = data as Record<string, unknown>;
  const arr = (o.result ?? o.rows ?? o.data) as unknown;
  if (!Array.isArray(arr)) return [];
  const out: string[] = [];
  for (const row of arr) {
    if (typeof row === "string") out.push(row);
    else if (Array.isArray(row) && row[0] != null) out.push(String(row[0]));
    else if (row && typeof row === "object" && column in row) {
      const v = (row as Record<string, unknown>)[column];
      if (v != null) out.push(String(v));
    }
  }
  return out;
}
