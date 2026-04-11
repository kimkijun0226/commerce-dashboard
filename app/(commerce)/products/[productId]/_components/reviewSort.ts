import type { ProductReviewListItem } from "@/features/reviews/api/getProductReviews";

export type ReviewSortOption = "newest" | "oldest";

export function sortReviewsByOption(
  list: ProductReviewListItem[],
  sort: ReviewSortOption,
): ProductReviewListItem[] {
  const copy = [...list];
  const t = (s: string) => new Date(s).getTime();
  if (sort === "newest") {
    copy.sort((a, b) => t(b.created_at) - t(a.created_at));
  } else {
    copy.sort((a, b) => t(a.created_at) - t(b.created_at));
  }
  return copy;
}
