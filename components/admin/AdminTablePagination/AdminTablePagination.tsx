"use client";

import type { AdminSelectOption } from "@/components/admin/types";
import { Pagination, type PaginationProps } from "@/components/ui";

export type AdminTablePaginationProps = Omit<
  PaginationProps,
  "page" | "total" | "pageSizeOptions"
> & {
  currentPage: number;
  totalPages: number;
  pageSizeOptions?: readonly AdminSelectOption[];
};

export function AdminTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  totalLabel,
  summaryPrefix,
  className,
}: AdminTablePaginationProps) {
  return (
    <Pagination
      page={currentPage}
      total={totalPages}
      onPageChange={onPageChange}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      onPageSizeChange={onPageSizeChange}
      totalLabel={totalLabel}
      summaryPrefix={summaryPrefix}
      className={className}
    />
  );
}
