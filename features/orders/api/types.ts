export type CreateOrderInput = {
  userId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export type CreateOrderResult = {
  orderId: string;
};

export function isCreateOrderInput(value: unknown): value is CreateOrderInput {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.userId !== "string") return false;
  if (!Array.isArray(o.items)) return false;
  return o.items.every((item: unknown) => {
    if (item === null || typeof item !== "object") return false;
    const i = item as Record<string, unknown>;
    return (
      typeof i.productId === "string" &&
      typeof i.quantity === "number" &&
      typeof i.unitPrice === "number"
    );
  });
}
