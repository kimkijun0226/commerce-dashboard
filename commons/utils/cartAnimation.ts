export type CartAnimationSource = { src: string; rect: DOMRect };

export function captureCartImage(element: HTMLElement | null): CartAnimationSource | null {
  const image = element?.querySelector("img");
  return image ? { src: image.currentSrc || image.src, rect: image.getBoundingClientRect() } : null;
}

export async function animateToCart(source: CartAnimationSource | null) {
  const target = document.querySelector<HTMLElement>("[data-cart-target]");
  if (!target || !source || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof target.animate !== "function") return;
  const destination = target.getBoundingClientRect();
  const { rect } = source;
  const dx = destination.left + destination.width / 2 - rect.left - rect.width / 2;
  const dy = destination.top + destination.height / 2 - rect.top - rect.height / 2;
  const image = document.createElement("img");
  image.src = source.src;
  image.alt = "";
  image.setAttribute("aria-hidden", "true");
  image.dataset.cartFlight = "true";
  Object.assign(image.style, {
    position: "fixed", left: `${rect.left}px`, top: `${rect.top}px`,
    width: `${rect.width}px`, height: `${rect.height}px`, objectFit: "cover",
    borderRadius: "16px", zIndex: "9999", pointerEvents: "none",
    boxShadow: "0 12px 36px #0002", transformOrigin: "center",
  });
  document.body.append(image);
  try {
    await image.animate([
      { transform: "translate(0, 0) scale(1)", opacity: 0.95 },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.5 - 80}px) scale(.55)`, opacity: 0.9, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(.07)`, opacity: 0.2 },
    ], { duration: 420, easing: "cubic-bezier(.32,.02,.58,1)", fill: "forwards" }).finished;
    target.getAnimations().forEach((animation) => animation.cancel());
    target.animate([
      { transform: "scale(1) rotate(0deg)" },
      { transform: "scale(1.35) rotate(0deg)", offset: 0.22 },
      { transform: "scale(1.12) rotate(-16deg)", offset: 0.42 },
      { transform: "scale(1.08) rotate(14deg)", offset: 0.6 },
      { transform: "scale(1.03) rotate(-8deg)", offset: 0.78 },
      { transform: "scale(1) rotate(0deg)" },
    ], { duration: 320, easing: "ease-out" });
  } catch (error) {
    // Route changes can cancel a flight; storage success must remain unaffected.
    if (!(error instanceof DOMException && error.name === "AbortError")) console.error("장바구니 애니메이션 실패", error);
  } finally {
    image.remove();
  }
}
