import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** PDP 리뷰 목록 + 작성자(users embed) */
export type Review = {
  id: string;
  user_id: string;
  rating: number;
  content: string | null;
  created_at: string;
  users: {
    display_name: string | null;
    email: string;
  } | null;
};

function normalizeUsersEmbed(
  raw: unknown,
): Review["users"] {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (first && typeof first === "object" && "email" in first) {
      const o = first as { display_name: string | null; email: string };
      return {
        display_name: o.display_name ?? null,
        email: o.email,
      };
    }
    return null;
  }
  if (typeof raw === "object" && raw !== null && "email" in raw) {
    const o = raw as { display_name: string | null; email: string };
    return {
      display_name: o.display_name ?? null,
      email: o.email,
    };
  }
  return null;
}

export async function fetchProductReviewsPage(
  productId: string,
  page: number,
  pageSize: number,
): Promise<Review[]> {
  const supabase = getSupabaseBrowserClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      user_id,
      rating,
      content,
      created_at,
      users (
        display_name,
        email
      )
    `,
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`리뷰 페이지 조회 실패: ${error.message}`);
  }

  const rows = data ?? [];
  return rows.map((row) => {
    const { users: u, ...rest } = row as {
      id: string;
      user_id: string;
      rating: number;
      content: string | null;
      created_at: string;
      users: unknown;
    };
    return {
      ...rest,
      users: normalizeUsersEmbed(u),
    };
  });
}
