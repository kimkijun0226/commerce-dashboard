"use client";
import { useActionState } from "react";
import { saveFulfillment } from "@/app/admin/orders/actions";
import { FULFILLMENT_LABELS } from "@/lib/admin/validation";
export function FulfillmentEditor({
  order,
}: {
  order: {
    id: string;
    updated_at: string;
    fulfillment_status: string;
    shipping_carrier: string | null;
    tracking_number: string | null;
  };
}) {
  const [state, action, pending] = useActionState(saveFulfillment, {});
  const field = "mt-2 w-full border border-gray-200 bg-white px-3 py-2 text-sm";
  return (
    <form
      action={action}
      className="space-y-4 border border-gray-200 bg-white p-5"
    >
      <h2 className="font-semibold">배송 관리</h2>
      <input type="hidden" name="orderId" value={order.id} />
      <input type="hidden" name="updatedAt" value={order.updated_at} />
      <label className="block text-sm">
        배송 상태
        <select
          name="fulfillmentStatus"
          defaultValue={order.fulfillment_status}
          className={field}
        >
          {Object.entries(FULFILLMENT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        배송사
        <input
          name="shippingCarrier"
          defaultValue={order.shipping_carrier ?? ""}
          maxLength={50}
          list="shipping-carriers"
          className={field}
          placeholder="예: CJ대한통운"
        />
        <datalist id="shipping-carriers">
          {[
            "CJ대한통운",
            "한진택배",
            "롯데택배",
            "우체국택배",
            "로젠택배",
            "경동택배",
            "직접배송",
          ].map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>
      <label className="block text-sm">
        송장번호
        <input
          name="trackingNumber"
          defaultValue={order.tracking_number ?? ""}
          maxLength={100}
          className={field}
          placeholder="배송중·배송완료 처리 시 필수"
        />
      </label>
      <p className="text-xs leading-5 text-gray-500">
        결제 완료 주문만 배송 처리할 수 있습니다. 송장 등록과 상태 변경은 저장
        버튼을 눌러 반영하세요.
      </p>
      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.saved ? (
        <p role="status" className="text-sm text-green-700">
          배송 정보가 저장되었습니다.
        </p>
      ) : null}
      <button
        disabled={pending}
        className="bg-black px-5 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "저장 중…" : "배송 정보 저장"}
      </button>
    </form>
  );
}
