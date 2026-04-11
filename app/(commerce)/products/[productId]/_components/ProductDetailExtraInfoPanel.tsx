"use client";

import { parseMeasurementRows } from "@/commons/utils/productDetailParse";
import {
  orderedSpecEntries,
  parseAdditionalInfoObject,
} from "@/commons/utils/productSpecs";
import type { Json } from "@/types/supabase";
import { cn } from "@/components/ui";

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
                  Field
                </th>
                <th
                  className="px-4 py-3 font-semibold text-[#141718] sm:px-5"
                  style={{ fontFamily: "var(--commerce-font-body)" }}
                >
                  Value
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
  measurements: string | null;
  additionalInfo: Json;
  className?: string;
};

export function ProductDetailExtraInfoPanel({
  measurements,
  additionalInfo,
  className,
}: ProductDetailExtraInfoPanelProps) {
  const measurementRows = parseMeasurementRows(measurements);
  const specMap = parseAdditionalInfoObject(additionalInfo);
  const notesText = (specMap.notes ?? "").trim();
  const { notes: _omit, ...restForTable } = specMap;
  void _omit;
  const specRows = orderedSpecEntries(restForTable);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-10 rounded-2xl border border-[#e8ecef] bg-[#fefefe] p-6 sm:p-8",
        className,
      )}
    >
      <SpecTable
        title="Additional details"
        rows={specRows}
        emptyMessage="No additional fields in additional_info (JSON object)."
      />

      <SpecTable
        title="Size & specifications"
        rows={measurementRows}
        emptyMessage="No size or specification data."
      />

      {notesText ? (
        <section className="flex flex-col gap-3 border-t border-[#e8ecef] pt-8">
          <h3
            className="text-lg font-semibold tracking-tight text-[#141718]"
            style={{ fontFamily: "var(--commerce-font-heading)" }}
          >
            Notes
          </h3>
          <p
            className="whitespace-pre-line text-base leading-[26px] text-[#353945]"
            style={{ fontFamily: "var(--commerce-font-body)" }}
          >
            {notesText}
          </p>
        </section>
      ) : null}
    </div>
  );
}
