import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { ReactNode } from "react";

export type AdminTableColumn<Row> = {
  key: keyof Row & string;
  header: string;
  align?: "left" | "right" | "center";
  scope?: "col" | "row";
};

export type AdminTableProps<Row extends Record<string, ReactNode>> =
  {
    columns: readonly AdminTableColumn<Row>[];
    rows: readonly Row[];
    className?: string;
    getRowKey?: (row: Row, index: number) => string | number;
  };

/**
 * 어드민 표준 테이블.
 * - 기존 `DataTable`을 Admin 명명으로 제공(향후 정렬/필터/로딩 확장 지점)
 */
export function AdminTable<Row extends Record<string, ReactNode>>(
  props: AdminTableProps<Row>,
) {
  const { columns, rows, className, getRowKey } = props;
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

