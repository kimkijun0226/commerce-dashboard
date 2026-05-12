export type Money = number;

export type LineItem = {
  productId: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: Money;
  unitSalePrice: Money | null;
};

export type PricingTotals = {
  subtotal: Money;
  shipping: Money;
  discount: Money;
  total: Money;
};

export function calcUnitPrice(unitPrice: Money, unitSalePrice: Money | null): Money {
  return unitSalePrice ?? unitPrice;
}

export function calcShippingFee(subtotal: Money): Money {
  return subtotal >= 50_000 ? 0 : 2_500;
}

export function computeLineSubtotal(item: LineItem): Money {
  return calcUnitPrice(item.unitPrice, item.unitSalePrice) * item.quantity;
}

export function computeTotals(items: LineItem[], discount: Money = 0): PricingTotals {
  const subtotal = items.reduce((sum, it) => sum + computeLineSubtotal(it), 0);
  const shipping = calcShippingFee(subtotal);
  const total = Math.max(0, subtotal + shipping - discount);
  return { subtotal, shipping, discount, total };
}

export function normalizeMoney(value: unknown): Money {
  // numeric(9,2) 같은 값도 있을 수 있어 number로 정규화 후 반올림
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

