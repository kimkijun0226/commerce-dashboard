import type { Meta, StoryObj } from "@storybook/react";

import { Radio } from "./Radio";

const meta: Meta<typeof Radio> = {
  title: "Shared/UI/Radio",
  component: Radio,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    onChange: { action: "change" },
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  args: {
    name: "plan",
    value: "basic",
    label: "베이직",
    description: "월 9,900원",
  },
};

export const Selected: Story = {
  args: {
    name: "plan",
    value: "pro",
    label: "프로",
    defaultChecked: true,
  },
};

export const Error: Story = {
  args: {
    name: "agree",
    value: "yes",
    label: "동의",
    error: "필수 항목입니다",
  },
};

export const Disabled: Story = {
  args: {
    name: "plan",
    value: "locked",
    label: "비활성 옵션",
    disabled: true,
  },
};

export const Group: Story = {
  render: (args) => (
    <fieldset className="flex flex-col gap-3 border-0 p-0">
      <legend className="sr-only">플랜 선택</legend>
      <Radio {...args} name="plan-group" value="a" label="옵션 A" defaultChecked />
      <Radio {...args} name="plan-group" value="b" label="옵션 B" />
      <Radio {...args} name="plan-group" value="c" label="옵션 C" />
    </fieldset>
  ),
  args: {},
};
