function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type ProductDetailAdditionalInfoProps = {
  /** Supabase `products.additional_info` */
  additionalInfo: string | null;
};

export function ProductDetailAdditionalInfo({
  additionalInfo,
}: ProductDetailAdditionalInfoProps) {
  const primary = additionalInfo?.trim() ?? "";

  if (!primary) {
    return (
      <p className="text-(--commerce-text-tertiary)">
        No additional information available.
      </p>
    );
  }

  return (
    <div className="w-full max-w-none">
      <div
        className="space-y-5 text-[15px] leading-[1.75] text-(--commerce-text-primary) sm:text-base sm:leading-8"
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        {splitParagraphs(primary).map((block, i) => (
          <p key={i} className="whitespace-pre-wrap">
            {block}
          </p>
        ))}
      </div>
    </div>
  );
}
