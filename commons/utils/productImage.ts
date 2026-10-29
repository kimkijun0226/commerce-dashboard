import { getImageProps } from "next/image";
import { shouldBypassImageOptimization } from "./imageOptimization";

export const CATALOG_IMAGE_SIZES = "(max-width: 479px) calc((100vw - 44px) / 2), (max-width: 639px) calc((100vw - 56px) / 3), (max-width: 767px) calc((100vw - 88px) / 3), (max-width: 1023px) calc((100vw - 108px) / 4), (max-width: 1535px) calc((100vw - 144px) / 5), (max-width: 1799px) calc((100vw - 164px) / 6), 273px";
export const DETAIL_IMAGE_SIZES = "(max-width: 639px) calc(100vw - 32px), (max-width: 767px) calc(100vw - 64px), (max-width: 1119px) calc((100vw - 112px) / 2), 504px";

export function canPrefetchImages() {
  if (typeof window === "undefined") return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !connection?.saveData && !["slow-2g", "2g"].includes(connection?.effectiveType ?? "");
}

const warming = new Set<string>();
export function warmProductImage(src: string, detail = false) {
  if (!src || !canPrefetchImages()) return;
  const key = `${detail}:${src}`;
  if (warming.has(key)) return;
  // Keep only a bounded set of intent-prefetched images during long browsing sessions.
  if (warming.size >= 200) warming.delete(warming.values().next().value!);
  warming.add(key);
  const { props } = getImageProps({ src, alt: "", fill: true,
    quality: detail ? 75 : 60, sizes: detail ? DETAIL_IMAGE_SIZES : CATALOG_IMAGE_SIZES,
    unoptimized: shouldBypassImageOptimization(src) });
  const image = new window.Image();
  image.decoding = "async";
  image.fetchPriority = "low";
  image.onerror = () => warming.delete(key);
  image.sizes = props.sizes ?? "";
  image.srcset = props.srcSet ?? "";
  image.src = props.src;
}
