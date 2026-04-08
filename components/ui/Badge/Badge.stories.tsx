import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Shared/UI/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "danger", "outline"],
    },
    size: { control: "select", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: "Badge" },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} variant="default">
        Default
      </Badge>
      <Badge {...args} variant="success">
        Success
      </Badge>
      <Badge {...args} variant="warning">
        Warning
      </Badge>
      <Badge {...args} variant="danger">
        Danger
      </Badge>
      <Badge {...args} variant="outline">
        Outline
      </Badge>
    </div>
  ),
  args: { size: "md" },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Badge {...args} size="sm">
        Small
      </Badge>
      <Badge {...args} size="md">
        Medium
      </Badge>
    </div>
  ),
  args: { variant: "outline" },
};

