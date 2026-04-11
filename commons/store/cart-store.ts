import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 상품 노출 상태
 *
 * - 요구사항 문서 기준 타입입니다.
 * - DB 스키마(0001_init_schema.sql)의 products.status는 'registered'를 사용하지만,
 *   장바구니 UI 레벨에서는 'visible'로 표현하는 경우가 있어 분리했습니다.
 */
export type ProductStatus = "visible" | "hidden" | "sold_out";

/**
 * 장바구니 아이템(= products 테이블에서 장바구니에 필요한 최소 필드)
 *
 * - id: products.id (uuid를 문자열로 보관)
 * - price / salePrice: products.price, products.sale_price 매핑
 * - imageUrl: products.image_url 매핑
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  salePrice: number | null;
  status?: ProductStatus;
}

/**
 * addItem에 전달되는 "상품" 타입
 *
 * - 수량은 별도 파라미터로 받기 때문에 quantity를 제외합니다.
 * - 실제 서비스에서는 products.Row에서 필요한 필드만 pick해서 넣어주면 됩니다.
 */
export type CartProduct = Omit<CartItem, "quantity">;

export interface CartState {
  /** 장바구니 담긴 아이템 목록 */
  items: CartItem[];

  /** 전체 수량 합계 (items 기반 자동 계산) */
  totalQuantity: number;

  /** 전체 금액 합계 (salePrice 우선, items 기반 자동 계산) */
  totalAmount: number;

  /**
   * 장바구니에 상품 추가
   * - 동일 id가 이미 있으면 quantity만 증가
   * - 없으면 새 아이템 추가
   * @returns 성공 여부 (예외 삼킴 시 false)
   */
  addItem: (product: CartProduct, quantity?: number) => boolean;

  /**
   * 특정 상품 수량 변경
   * - quantity <= 0 이면 해당 아이템 제거
   */
  updateItemQuantity: (productId: string, quantity: number) => void;

  /** 특정 상품 제거 */
  removeItem: (productId: string) => void;

  /** 장바구니 비우기 */
  clear: () => void;
}

const STORAGE_KEY = "commerce_cart_v1";

function clampQuantity(value: number): number {
  // 장바구니 수량은 정수 양수만 의미가 있으므로, UI/입력 오류를 방어합니다.
  if (!Number.isFinite(value)) return 0;
  return Math.floor(value);
}
function getUnitPrice(item: Pick<CartItem, "price" | "salePrice">): number {
  // 할인 가격이 있으면 salePrice를 우선 적용합니다.
  return item.salePrice ?? item.price;
}

function computeTotals(
  items: CartItem[],
): Pick<CartState, "totalAmount" | "totalQuantity"> {
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = items.reduce(
    (acc, item) => acc + getUnitPrice(item) * item.quantity,
    0,
  );
  return { totalQuantity, totalAmount };
}

function removeById(items: CartItem[], productId: string): CartItem[] {
  return items.filter((it) => it.id !== productId);
}

function upsertItem(
  items: CartItem[],
  product: CartProduct,
  addQty: number,
): CartItem[] {
  const nextQty = clampQuantity(addQty);
  if (nextQty <= 0) return items;

  const idx = items.findIndex((it) => it.id === product.id);
  if (idx === -1) {
    // 새 아이템 추가
    return [...items, { ...product, quantity: nextQty }];
  }

  // 기존 아이템이면 수량만 증가
  const prev = items[idx];
  const updated: CartItem = { ...prev, quantity: prev.quantity + nextQty };
  const next = items.slice();
  next[idx] = updated;
  return next;
}

function updateQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  const nextQty = clampQuantity(quantity);
  if (nextQty <= 0) return removeById(items, productId);

  const idx = items.findIndex((it) => it.id === productId);
  if (idx === -1) return items;

  const prev = items[idx];
  const next = items.slice();
  next[idx] = { ...prev, quantity: nextQty };
  return next;
}

/**
 * 장바구니 Zustand 스토어
 *
 * - persist 미들웨어로 localStorage에 저장합니다.
 * - 저장 시에는 items만 보관하고, total* 값은 로드/액션마다 다시 계산합니다.
 *   (데이터 무결성을 위해 파생값은 항상 items 기준으로 유지)
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,
      totalAmount: 0,

      addItem: (product, quantity = 1) => {
        try {
          const items = get().items;
          const nextItems = upsertItem(items, product, quantity);
          const totals = computeTotals(nextItems);
          set({ items: nextItems, ...totals });
          return true;
        } catch (err) {
          // 장바구니는 UX 핵심이라, 예외 발생 시 앱 전체가 죽지 않게 방어합니다.
          console.error("addItem 실패:", err);
          return false;
        }
      },

      updateItemQuantity: (productId, quantity) => {
        try {
          const items = get().items;
          const nextItems = updateQuantity(items, productId, quantity);
          const totals = computeTotals(nextItems);
          set({ items: nextItems, ...totals });
        } catch (err) {
          console.error("updateItemQuantity 실패:", err);
        }
      },

      removeItem: (productId) => {
        try {
          const items = get().items;
          const nextItems = removeById(items, productId);
          const totals = computeTotals(nextItems);
          set({ items: nextItems, ...totals });
        } catch (err) {
          console.error("removeItem 실패:", err);
        }
      },

      clear: () => {
        try {
          set({ items: [], totalQuantity: 0, totalAmount: 0 });
        } catch (err) {
          console.error("clear 실패:", err);
        }
      },
    }),
    {
      name: STORAGE_KEY,
      // items만 저장하고, total*은 items로부터 재계산되도록 partialize 합니다.
      partialize: (state) => ({ items: state.items }),
      // localStorage 복원 시 total*을 items 기반으로 복구합니다.
      onRehydrateStorage: () => (state, err) => {
        if (err) {
          console.error("장바구니 스토어 복원 실패:", err);
          return;
        }
        if (!state) return;
        const totals = computeTotals(state.items);
        state.totalAmount = totals.totalAmount;
        state.totalQuantity = totals.totalQuantity;
      },
    },
  ),
);
