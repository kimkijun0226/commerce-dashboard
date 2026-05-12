import { Suspense } from "react";
import { PaymentFailBody } from "./PaymentFailBody";

export default function CheckoutPaymentFailPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-16">
          <pre className="rounded-lg bg-neutral-100 p-4 text-xs">{JSON.stringify({ loading: true }, null, 2)}</pre>
        </main>
      }
    >
      <PaymentFailBody />
    </Suspense>
  );
}
