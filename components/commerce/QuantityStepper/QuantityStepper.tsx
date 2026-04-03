"use client";

import {
  QuantitySelector,
  type QuantitySelectorProps,
} from "../QuantitySelector/QuantitySelector";

/** @deprecated `variant`를 쓰는 `QuantitySelector` 권장. `size`는 `variant`로 매핑됩니다. */
export type QuantityStepperProps = Omit<
  QuantitySelectorProps,
  "variant"
> & {
  size?: "sm" | "md";
};

export function QuantityStepper({
  size = "md",
  ...rest
}: QuantityStepperProps) {
  return (
    <QuantitySelector
      variant={size === "sm" ? "cart" : "product"}
      {...rest}
    />
  );
}
