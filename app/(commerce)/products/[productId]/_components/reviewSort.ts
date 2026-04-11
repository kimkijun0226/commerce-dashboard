import type { ProductReviewListItem } from "@/features/reviews/api/getProductReviews";

export type ReviewSortOption =
  | "newest"
  | "oldest"
  | "rating_high"
  | "rating_low";

export const REVIEW_SORT_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: "newest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "rating_high", label: "별점 높은순" },
  { value: "rating_low", label: "별점 낮은순" },
];

export function sortReviewsByOption(
  list: ProductReviewListItem[],
  sort: ReviewSortOption,
): ProductReviewListItem[] {
  const copy = [...list];
  const t = (s: string) => new Date(s).getTime();

  if (sort === "newest") {
    copy.sort((a, b) => t(b.created_at) - t(a.created_at));
    return copy;
  }
  if (sort === "oldest") {
    copy.sort((a, b) => t(a.created_at) - t(b.created_at));
    return copy;
  }
  if (sort === "rating_high") {
    copy.sort(
      (a, b) =>
        b.rating - a.rating || t(b.created_at) - t(a.created_at),
    );
    return copy;
  }
  copy.sort(
    (a, b) => a.rating - b.rating || t(b.created_at) - t(a.created_at),
  );
  return copy;
}

export function labelForSortOption(sort: ReviewSortOption): string {
  return (
    REVIEW_SORT_OPTIONS.find((o) => o.value === sort)?.label ?? sort
  );
}
