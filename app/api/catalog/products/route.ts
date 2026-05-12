import { NextRequest, NextResponse } from "next/server";
import { CATALOG_PAGE_SIZE, CATALOG_SEARCH_PAGE_SIZE } from "@/lib/catalog/constants";
import { getCatalogProducts } from "@/lib/catalog/products";

function normalizeInt(value: string | null, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.floor(n);
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get("q") ?? "";
  const page = Math.max(0, normalizeInt(sp.get("page"), 0));

  const defaultSize = q.trim().length > 0 ? CATALOG_SEARCH_PAGE_SIZE : CATALOG_PAGE_SIZE;
  const pageSize = Math.max(1, Math.min(200, normalizeInt(sp.get("pageSize"), defaultSize)));

  try {
    const { items, hasMore } = await getCatalogProducts({ q, page, pageSize });
    return NextResponse.json({ items, page, pageSize, hasMore });
  } catch (err) {
    const message = err instanceof Error ? err.message : "상품 조회에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

