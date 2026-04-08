import type { ReactNode } from "react";

/**
 * 어드민 화면에서 재사용되는 공통 타입 모음.
 * - Figma `310:2924` 기반 컴포넌트/레이아웃에서 필요한 최소 스펙만 정의
 */

export type AdminSelectOption = {
  value: string;
  label: string;
};

export type AdminSidebarItem = {
  key: string;
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  active?: boolean;
  disabled?: boolean;
};

export type AdminSettingsField = {
  id: string;
  label: ReactNode;
  helperText?: ReactNode;
  value?: string;
  placeholder?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  disabled?: boolean;
  onChange?: (next: string) => void;
};

