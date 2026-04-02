"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type CreateOrderInput = {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
};

export type CreateOrderResult = {
  orderId: string;
};

/**
 * 주문 생성 Mutation 훅
 *
 * 사용 예시:
 * ```typescript
 * const { mutateAsync, isPending, isError, error } = useCreateOrderMutation();
 * const onCheckout = async () => {
 *   const result = await mutateAsync({
 *     userId,
 *     items: [{ productId, quantity: 2, unitPrice: 19900 }],
 *   });
 *   console.log("생성된 주문 ID:", result.orderId);
 * };
 * ```
 */
export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResult, Error, CreateOrderInput>({
    mutationFn: async (input) => {
      const supabase = getSupabaseBrowserClient();

      const totalAmount = input.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: input.userId,
          total_amount: totalAmount,
          status: "pending",
          payment_status: "requested",
        })
        .select("id")
        .single();

      if (orderError) {
        throw new Error(`주문 생성 실패: ${orderError.message}`);
      }

      const orderId = order.id;

      const { error: itemsError } = await supabase.from("order_items").insert(
        input.items.map((item) => ({
          order_id: orderId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      );

      if (itemsError) {
        throw new Error(`주문 상품 생성 실패: ${itemsError.message}`);
      }

      return { orderId };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
    },
  });
}
