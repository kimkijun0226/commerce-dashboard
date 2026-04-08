import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Shared/UI/Input",
  component: Input,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "underline"] },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    onChange: { action: "change" },
    onFocus: { action: "focus" },
    onBlur: { action: "blur" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: "이메일",
    placeholder: "name@example.com",
  },
};

export const Underline: Story = {
  args: {
    variant: "underline",
    label: "이름",
    placeholder: "홍길동",
  },
};

export const WithDescription: Story = {
  args: {
    label: "비밀번호",
    type: "password",
    description: "영문/숫자 조합 8자 이상",
    placeholder: "********",
  },
};

export const Error: Story = {
  args: {
    label: "전화번호",
    placeholder: "010-0000-0000",
    error: "형식이 올바르지 않습니다",
  },
};

export const Disabled: Story = {
  args: {
    label: "비활성",
    placeholder: "disabled",
    disabled: true,
  },
};

