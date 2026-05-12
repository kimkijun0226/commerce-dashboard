"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartItemRow, CartSummary } from "@/components/commerce";
import { useCartStore } from "@/commons/store/cart-store";
import { useSessionStore } from "@/commons/store/session-store";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import { CheckoutProgress } from "@/components/commerce/CheckoutProgress";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const shippingFee = useCartStore((s) => s.shippingFee);
  const total = useCartStore((s) => s.total);
  const totalQuantity = useCartStore((s) => s.totalQuantity);
  const isSyncing = useCartStore((s) => s.isSyncing);
  const syncWithServer = useCartStore((s) => s.syncWithServer);
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const userId = useSessionStore((s) => s.user?.id ?? null);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-8">
      <header className="text-center">
        <h1
          className="text-[54px] font-medium leading-[58px] tracking-[-1px]"
          style={{
            fontFamily: commerceTypography.headline3.fontFamily,
            color: commerceColors.text.primary,
          }}
        >
          Cart
        </h1>
        <CheckoutProgress currentStep={1} />
      </header>

      {items.length === 0 ? (
        <section className="mx-auto mt-20 flex max-w-[560px] flex-col items-center rounded-2xl border border-(--commerce-border-subtle) px-8 py-14 text-center">
          <p
            style={{
              ...typographyToStyle(commerceTypography.body1Semi),
              color: commerceColors.text.primary,
            }}
          >
            장바구니가 비어 있습니다.
          </p>
          <p
            className="mt-3"
            style={{
              ...typographyToStyle(commerceTypography.body2),
              color: commerceColors.text.secondary,
            }}
          >
            마음에 드는 상품을 담고 한 번에 확인해 보세요.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-[52px] min-w-[180px] items-center justify-center rounded-lg bg-(--commerce-primary-main) px-8 text-white transition-opacity hover:opacity-90"
            style={typographyToStyle(commerceTypography.buttonM)}
          >
            상품 보러 가기
          </Link>
        </section>
      ) : (
        <section className="mx-auto mt-20 grid max-w-[1200px] gap-12 lg:grid-cols-[minmax(0,1fr)_413px] lg:items-start lg:gap-16">
          <div className="w-full">
            <div
              className="hidden border-b border-(--commerce-border-strong) pb-6 sm:grid sm:grid-cols-[minmax(0,1fr)_80px_90px_96px] sm:items-center sm:gap-x-5"
              style={{
                ...typographyToStyle(commerceTypography.body2Semi),
                color: commerceColors.primary.dark,
              }}
            >
              <span>Product</span>
              <span className="text-center">Quantity</span>
              <span className="text-center">Price</span>
              <span className="text-center">Subtotal</span>
            </div>

            <div aria-busy={isSyncing || undefined}>
              {items.map((item) => {
                const unitPrice = item.salePrice ?? item.price;
                return (
                  <CartItemRow
                    key={item.id}
                    name={item.name}
                    imageUrl={item.imageUrl ?? undefined}
                    quantity={item.quantity}
                    unitPrice={unitPrice}
                    lineTotal={unitPrice * item.quantity}
                    onQuantityChange={(next) =>
                      void updateItemQuantity(item.id, next)
                    }
                    onRemove={() => void removeItem(item.id)}
                    disabled={isSyncing}
                  />
                );
              })}
            </div>
          </div>

          <CartSummary
            subtotal={subtotal}
            shipping={shippingFee}
            total={total}
            disabled={totalQuantity === 0}
            className="rounded-md border-(--commerce-border-strong) p-6 lg:sticky lg:top-24"
            onCheckout={async () => {
              // Checkout 페이지는 서버(DB cart_items)를 읽기 때문에,
              // 넘어가기 전에 반드시 서버 장바구니로 동기화한다.
              if (isAuthenticated && userId) {
                await syncWithServer(userId);
              }
              // sync 결과가 비어있으면 checkout으로 보내지 않음
              if (useCartStore.getState().totalQuantity === 0) {
                toast.message("장바구니가 비어 있습니다.");
                return;
              }
              router.push("/checkout");
            }}
          />
        </section>
      )}
    </div>
  );
}
