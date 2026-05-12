import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProductStatus = "visible" | "hidden" | "sold_out";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  salePrice: number | null;
  status?: ProductStatus;
}

export type CartProduct = Omit<CartItem, "quantity">;

type CartApiItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  salePrice: number | null;
  status?: "registered" | "hidden" | "sold_out" | ProductStatus;
};

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  /** 상품 합계(할인 적용 후) */
  subtotal: number;
  /** 배송비 */
  shippingFee: number;
  /** 결제 예정 금액(상품 합계 + 배송비 - 할인) */
  total: number;
  isSyncing: boolean;
  cartOwner: "guest" | string | null;
  syncWithServer: (userId: string) => Promise<void>;
  addItem: (product: CartProduct, quantity?: number) => Promise<boolean>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  resetForGuest: () => void;
  clear: () => void;
}

const STORAGE_KEY = "commerce_cart_v1";

function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.floor(value);
}

function getUnitPrice(item: Pick<CartItem, "price" | "salePrice">): number {
  return item.salePrice ?? item.price;
}

export function calcShippingFee(subtotal: number): number {
  // subtotal >= 50,000원 무료 배송
  return subtotal >= 50_000 ? 0 : 2_500;
}

function computeTotals(
  items: CartItem[],
): Pick<CartState, "subtotal" | "totalQuantity" | "shippingFee" | "total"> {
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + getUnitPrice(item) * item.quantity,
    0,
  );
  const shippingFee = calcShippingFee(subtotal);
  const total = Math.max(0, subtotal + shippingFee);
  return { totalQuantity, subtotal, shippingFee, total };
}

function normalizeStatus(status: CartApiItem["status"]): ProductStatus {
  if (status === "hidden") return "hidden";
  if (status === "sold_out") return "sold_out";
  return "visible";
}

function fromApiItem(item: CartApiItem): CartItem {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.price),
    salePrice: item.salePrice == null ? null : Number(item.salePrice),
    imageUrl: item.imageUrl,
    quantity: clampQuantity(item.quantity),
    status: normalizeStatus(item.status),
  };
}

function setItemsState(items: CartItem[]) {
  return { items, ...computeTotals(items) };
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
  if (idx === -1) return [...items, { ...product, quantity: nextQty }];

  const next = items.slice();
  next[idx] = { ...next[idx], quantity: next[idx].quantity + nextQty };
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

  const next = items.slice();
  next[idx] = { ...next[idx], quantity: nextQty };
  return next;
}

async function parseCartResponse(res: Response): Promise<CartItem[] | null> {
  if (res.status === 401) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "장바구니 API 요청에 실패했습니다.");
  }
  const json = (await res.json()) as { items?: CartApiItem[] };
  return (json.items ?? []).map(fromApiItem);
}

async function requestCart(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<CartItem[] | null> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  return parseCartResponse(res);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,
      subtotal: 0,
      shippingFee: 0,
      total: 0,
      isSyncing: false,
      cartOwner: null,

      syncWithServer: async (userId) => {
        set({ isSyncing: true });
        try {
          const localItems = get().items;
          const cartOwner = get().cartOwner;
          const serverItems = await requestCart("/api/cart", { method: "GET" });
          if (!serverItems) {
            set({ isSyncing: false });
            return;
          }

          const serverIds = new Set(serverItems.map((item) => item.id));
          const itemsToMerge =
            cartOwner === "guest"
              ? localItems.filter((item) => !serverIds.has(item.id))
              : [];
          let nextItems = serverItems;

          // 비로그인 상태에서 담아둔 로컬 장바구니를 로그인 후 서버 장바구니로 이관합니다.
          for (const item of itemsToMerge) {
            const merged = await requestCart("/api/cart", {
              method: "POST",
              body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
            });
            if (merged) nextItems = merged;
          }

          set({
            ...setItemsState(nextItems),
            isSyncing: false,
            cartOwner: userId,
          });
        } catch (err) {
          console.error("syncWithServer 실패:", err);
          set({ isSyncing: false });
        }
      },

      addItem: async (product, quantity = 1) => {
        const prevItems = get().items;
        const nextItems = upsertItem(prevItems, product, quantity);
        set(setItemsState(nextItems));

        try {
          const serverItems = await requestCart("/api/cart", {
            method: "POST",
            body: JSON.stringify({ productId: product.id, quantity }),
          });
          if (serverItems) set(setItemsState(serverItems));
          else set({ cartOwner: "guest" });
          return true;
        } catch (err) {
          console.error("addItem 실패:", err);
          set(setItemsState(prevItems));
          return false;
        }
      },

      updateItemQuantity: async (productId, quantity) => {
        const prevItems = get().items;
        const nextItems = updateQuantity(prevItems, productId, quantity);
        set(setItemsState(nextItems));

        try {
          const serverItems = await requestCart("/api/cart", {
            method: "PATCH",
            body: JSON.stringify({ productId, quantity }),
          });
          if (serverItems) set(setItemsState(serverItems));
          else set({ cartOwner: "guest" });
        } catch (err) {
          console.error("updateItemQuantity 실패:", err);
          set(setItemsState(prevItems));
        }
      },

      removeItem: async (productId) => {
        const prevItems = get().items;
        const nextItems = removeById(prevItems, productId);
        set(setItemsState(nextItems));

        try {
          const serverItems = await requestCart(
            `/api/cart?productId=${encodeURIComponent(productId)}`,
            { method: "DELETE" },
          );
          if (serverItems) set(setItemsState(serverItems));
          else set({ cartOwner: "guest" });
        } catch (err) {
          console.error("removeItem 실패:", err);
          set(setItemsState(prevItems));
        }
      },

      resetForGuest: () => {
        const owner = get().cartOwner;
        if (owner === "guest") return;
        set({
          items: [],
          totalQuantity: 0,
          subtotal: 0,
          shippingFee: 0,
          total: 0,
          cartOwner: "guest",
        });
      },

      clear: () => {
        set({ items: [], totalQuantity: 0, subtotal: 0, shippingFee: 0, total: 0 });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        items: state.items,
        cartOwner: state.cartOwner,
      }),
      onRehydrateStorage: () => (state, err) => {
        if (err) {
          console.error("장바구니 스토어 복원 실패:", err);
          return;
        }
        if (!state) return;
        if (state.cartOwner !== "guest" && state.cartOwner !== null) {
          state.items = [];
          state.cartOwner = "guest";
        }
        const totals = computeTotals(state.items);
        state.subtotal = totals.subtotal;
        state.shippingFee = totals.shippingFee;
        state.total = totals.total;
        state.totalQuantity = totals.totalQuantity;
      },
    },
  ),
);

