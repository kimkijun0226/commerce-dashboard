"use client";

import {
  additionalInfoPlainText,
  parseMeasurementRows,
} from "@/commons/utils/productDetailParse";
import { orderedSpecEntries } from "@/commons/utils/productSpecs";
import { cn } from "@/components/ui";

const FALLBACK_BLURBS = [
  "제품별 소재·세탁·보관 방법은 라벨 및 동봉 안내서를 우선 확인해 주세요.",
  "전자제품은 전원 어댑터 규격과 사용 환경(온도·습도)을 지켜 주시면 수명을 유지하는 데 도움이 됩니다.",
  "의류·잡화는 착용 전 보관 상태를 확인하고, 이상이 있을 경우 고객센터로 연락해 주세요.",
] as const;

function fallbackCopy(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return FALLBACK_BLURBS[Math.abs(h) % FALLBACK_BLURBS.length] ?? FALLBACK_BLURBS[0];
}

function SpecTable({
  title,
  rows,
  emptyMessage,
}: {
  title: string;
  rows: { label: string; value: string }[];
  emptyMessage: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3
        className="text-lg font-semibold tracking-tight text-[#141718]"
        style={{ fontFamily: "var(--commerce-font-heading)" }}
      >
        {title}
      </h3>
      {rows.length === 0 ? (
        <p
          className="text-sm leading-6 text-[#6c7275]"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#e8ecef]">
          <table className="w-full min-w-[280px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#e8ecef] bg-[#f6f7f8]">
                <th
                  className="px-4 py-3 font-semibold text-[#141718] sm:px-5"
                  style={{ fontFamily: "var(--commerce-font-body)" }}
                >
                  항목
                </th>
                <th
                  className="px-4 py-3 font-semibold text-[#141718] sm:px-5"
                  style={{ fontFamily: "var(--commerce-font-body)" }}
                >
                  내용
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={`${row.label}-${row.value}-${i}`}
                  className="border-b border-[#e8ecef] last:border-b-0"
                >
                  <td
                    className="align-top px-4 py-3 font-medium text-[#353945] sm:px-5"
                    style={{ fontFamily: "var(--commerce-font-body)" }}
                  >
                    {row.label || "—"}
                  </td>
                  <td
                    className="align-top px-4 py-3 text-[#353945] sm:px-5"
                    style={{ fontFamily: "var(--commerce-font-body)" }}
                  >
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export type ProductDetailExtraInfoPanelProps = {
  productName: string;
  measurements: string | null;
  additionalInfo: string | null;
  additionalInfoSpecs: Record<string, string>;
  className?: string;
};

export function ProductDetailExtraInfoPanel({
  productName,
  measurements,
  additionalInfo,
  additionalInfoSpecs,
  className,
}: ProductDetailExtraInfoPanelProps) {
  const measurementRows = parseMeasurementRows(measurements);
  const specRows = orderedSpecEntries(additionalInfoSpecs);
  const body = additionalInfoPlainText(additionalInfo);
  const narrative =
    body.trim().length > 0 ? body : fallbackCopy(productName);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-10 rounded-2xl border border-[#e8ecef] bg-[#fefefe] p-6 sm:p-8",
        className,
      )}
    >
      <SpecTable
        title="제품 추가 정보"
        rows={specRows}
        emptyMessage="등록된 추가 정보가 없습니다. (Supabase additional_info_specs)"
      />

      <SpecTable
        title="사이즈 · 규격"
        rows={measurementRows}
        emptyMessage="등록된 규격 정보가 없습니다."
      />

      <section className="flex flex-col gap-3 border-t border-[#e8ecef] pt-8">
        <h3
          className="text-lg font-semibold tracking-tight text-[#141718]"
          style={{ fontFamily: "var(--commerce-font-heading)" }}
        >
          안내 문구
        </h3>
        <p
          className="whitespace-pre-line text-base leading-[26px] text-[#353945]"
          style={{ fontFamily: "var(--commerce-font-body)" }}
        >
          {narrative}
        </p>
      </section>
    </div>
  );
}
