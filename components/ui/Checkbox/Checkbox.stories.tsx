import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Shared/UI/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    onChange: { action: "change" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: "약관에 동의합니다",
    description: "필수 항목입니다",
  },
};

export const Checked: Story = {
  args: {
    label: "체크됨",
    defaultChecked: true,
  },
};

export const Error: Story = {
  args: {
    label: "에러 상태",
    error: "필수 동의가 필요합니다",
  },
};

export const Disabled: Story = {
  args: {
    label: "비활성",
    disabled: true,
  },
};

