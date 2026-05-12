import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database, ProductStatus } from "@/types/supabase";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type ProductRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "name" | "price" | "sale_price" | "image_url" | "status"
>;

type CartRow = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  products: ProductRow | ProductRow[] | null;
};

type CartItemDto = {
  id: string;
  cartItemId: string;
  name: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  status: ProductStatus;
  quantity: number;
};

function unauthorized() {
  return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function normalizeQuantity(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.floor(n);
}

function normalizeProduct(raw: CartRow["products"]): ProductRow | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

function toDto(row: CartRow): CartItemDto | null {
  const product = normalizeProduct(row.products);
  if (!product) return null;
  return {
    id: row.product_id,
    cartItemId: row.id,
    name: product.name,
    price: Number(product.price),
    salePrice: product.sale_price == null ? null : Number(product.sale_price),
    imageUrl: product.image_url,
    status: product.status,
    quantity: row.quantity,
  };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { supabase, user };
}

async function listCart(
  supabase: SupabaseClient,
  userId: string,
): Promise<NextResponse> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      user_id,
      product_id,
      quantity,
      created_at,
      updated_at,
      products (
        id,
        name,
        price,
        sale_price,
        image_url,
        status
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = ((data ?? []) as unknown as CartRow[])
    .map(toDto)
    .filter((item): item is CartItemDto => Boolean(item));

  return NextResponse.json({ items });
}

export async function GET() {
  const auth = await requireUser();
  if (!auth) return unauthorized();
  return listCart(auth.supabase, auth.user.id);
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorized();

  const body = (await request.json().catch(() => null)) as {
    productId?: unknown;
    quantity?: unknown;
  } | null;
  const productId = String(body?.productId ?? "").trim();
  const addQty = normalizeQuantity(body?.quantity ?? 1);

  if (!productId) return badRequest("상품 정보가 올바르지 않습니다.");
  if (addQty <= 0) return badRequest("수량은 1개 이상이어야 합니다.");

  const { data: existing, error: readError } = await auth.supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", auth.user.id)
    .eq("product_id", productId)
    .maybeSingle();
  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }

  const nextQty = (existing?.quantity ?? 0) + addQty;
  const { error } = await auth.supabase.from("cart_items").upsert(
    {
      user_id: auth.user.id,
      product_id: productId,
      quantity: nextQty,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,product_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return listCart(auth.supabase, auth.user.id);
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorized();

  const body = (await request.json().catch(() => null)) as {
    productId?: unknown;
    quantity?: unknown;
  } | null;
  const productId = String(body?.productId ?? "").trim();
  const quantity = normalizeQuantity(body?.quantity);

  if (!productId) return badRequest("상품 정보가 올바르지 않습니다.");

  if (quantity <= 0) {
    const { error } = await auth.supabase
      .from("cart_items")
      .delete()
      .eq("user_id", auth.user.id)
      .eq("product_id", productId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return listCart(auth.supabase, auth.user.id);
  }

  const { error } = await auth.supabase
    .from("cart_items")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("user_id", auth.user.id)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return listCart(auth.supabase, auth.user.id);
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorized();

  const urlProductId = request.nextUrl.searchParams.get("productId");
  const body = (await request.json().catch(() => null)) as {
    productId?: unknown;
  } | null;
  const productId = String(urlProductId ?? body?.productId ?? "").trim();

  if (!productId) return badRequest("상품 정보가 올바르지 않습니다.");

  const { error } = await auth.supabase
    .from("cart_items")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return listCart(auth.supabase, auth.user.id);
}

