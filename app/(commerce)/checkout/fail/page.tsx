import { Suspense } from "react";
import { CheckoutFailClient } from "./CheckoutFailClient";

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutFailClient />
    </Suspense>
  );
}

