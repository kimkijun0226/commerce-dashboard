import type { Meta, StoryObj } from "@storybook/react";

import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Shared/UI/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    onCheckedChange: { action: "checkedChange" },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    checked: true,
    label: "알림 받기",
    labelId: "notify",
  },
};

export const Off: Story = {
  args: {
    checked: false,
    label: "마케팅 수신",
    labelId: "marketing",
  },
};

export const Disabled: Story = {
  args: {
    checked: true,
    label: "비활성",
    labelId: "disabled",
    disabled: true,
  },
};

