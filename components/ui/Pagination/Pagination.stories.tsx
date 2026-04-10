"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Shared/UI/Pagination",
  component: Pagination,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    onPageChange: { action: "pageChange" },
    onPageSizeChange: { action: "pageSizeChange" },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

const pageSizes = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "50", label: "50" },
] as const;

export const NumbersOnly: Story = {
  args: {
    page: 1,
    total: 5,
  },
};

export const ManyPages: Story = {
  args: {
    page: 5,
    total: 20,
  },
};

export const WithSummary: Story = {
  args: {
    page: 1,
    total: 8,
    pageSize: "10",
    pageSizeOptions: pageSizes,
    totalLabel: "of 50",
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [page, setPage] = useState(3);
    const [pageSize, setPageSize] = useState("10");
    return (
      <div className="max-w-3xl">
        <Pagination
          page={page}
          total={12}
          onPageChange={setPage}
          pageSize={pageSize}
          pageSizeOptions={pageSizes}
          onPageSizeChange={setPageSize}
          totalLabel="of 120"
        />
        <p className="mt-4 text-sm text-neutral-500">
          현재 페이지: {page}, 페이지 크기: {pageSize}
        </p>
      </div>
    );
  },
};
