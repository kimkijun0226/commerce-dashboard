import type { Meta, StoryObj } from "@storybook/react";

import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Shared/UI/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    onChange: { action: "change" },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const options = [
  { value: "free", label: "Free shipping" },
  { value: "express", label: "Express" },
  { value: "pickup", label: "Pickup" },
] as const;

export const Default: Story = {
  args: {
    label: "배송 옵션",
    options,
    defaultValue: "free",
  },
};

export const WithDescription: Story = {
  args: {
    label: "기간",
    description: "최근 30일 기준",
    options: [
      { value: "7d", label: "최근 7일" },
      { value: "30d", label: "최근 30일" },
      { value: "90d", label: "최근 90일" },
    ],
    defaultValue: "30d",
  },
};

export const Error: Story = {
  args: {
    label: "필수 선택",
    options,
    error: "옵션을 선택해주세요",
  },
};

export const Disabled: Story = {
  args: {
    label: "비활성",
    options,
    disabled: true,
  },
};

