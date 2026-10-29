/** Keep arbitrary user-hosted images working; optimize only configured remote hosts. */
export function shouldBypassImageOptimization(src: string): boolean {
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    const url = new URL(src);
    return url.protocol !== "https:" || ![
      "www.charmer.kr",
      "images.unsplash.com",
      "www.cosrx.com",
      "cdn.shopify.com",
      "fermliving.com",
      "placehold.co",
      "shopping-phinf.pstatic.net",
    ].includes(url.hostname);
  } catch {
    return true;
  }
}
