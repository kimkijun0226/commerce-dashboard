import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { ReactNode } from "react";

export type DataTableColumn<Row> = {
  key: keyof Row & string;
  header: string;
  align?: "left" | "right" | "center";
  scope?: "col" | "row";
};

export type DataTableProps<Row extends Record<string, ReactNode>> = {
  columns: readonly DataTableColumn<Row>[];
  rows: readonly Row[];
  className?: string;
  getRowKey?: (row: Row, index: number) => string | number;
};

export function DataTable<Row extends Record<string, ReactNode>>({
  columns,
  rows,
  className,
  getRowKey,
}: DataTableProps<Row>) {
  const headerTypo = typographyToStyle(adminTypography.tableHeader);
  const cellTypo = typographyToStyle(adminTypography.tableCell);

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table
        className="w-full border-collapse text-left"
        style={{ color: adminColors.text.primary }}
      >
        <thead>
          <tr
            style={{
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              borderColor: adminColors.border.brandSubtle,
            }}
          >
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope={col.scope ?? "col"}
                className="px-4 py-3"
                style={{
                  ...headerTypo,
                  color: adminColors.text.secondary,
                  textAlign: col.align ?? "left",
                  borderRightWidth: 1,
                  borderRightStyle: "solid",
                  borderColor: adminColors.border.default,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={getRowKey?.(row, rowIndex) ?? rowIndex}
              style={{
                borderBottomWidth: 1,
                borderBottomStyle: "solid",
                borderColor: adminColors.border.brandSubtle,
              }}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-4 py-3"
                  style={{
                    ...cellTypo,
                    textAlign: col.align ?? "left",
                    borderRightWidth: 1,
                    borderRightStyle: "solid",
                    borderColor: adminColors.border.default,
                  }}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
