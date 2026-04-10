import type { Meta, StoryObj } from "@storybook/react";

import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Shared/UI/SearchInput",
  component: SearchInput,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    actionLabel: { control: "text" },
    onAction: { action: "action" },
    onChange: { action: "change" },
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {},
};

export const NoButton: Story = {
  args: {
    actionLabel: "",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

