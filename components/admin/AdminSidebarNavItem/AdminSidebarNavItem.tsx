import { SidebarNavItem } from "@/components/admin/SidebarNavItem";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Base = {
  active?: boolean;
  icon?: ReactNode;
  className?: string;
  label: ReactNode;
  badge?: ReactNode;
  rightIcon?: ReactNode;
};

export type AdminSidebarNavItemProps =
  | (Base & {
      href: string;
    } & Omit<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        "className" | "children" | "href"
      >)
  | (Base & {
      href?: undefined;
    } & Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        "className" | "children" | "type"
      >);

/**
 * Figma(310:2924) Sidebar `List` 패턴용 래퍼.
 * - 기존 `SidebarNavItem`을 기반으로 badge/우측 아이콘 표현만 확장
 */
export function AdminSidebarNavItem({
  label,
  badge,
  rightIcon,
  ...rest
}: AdminSidebarNavItemProps) {
  const trailing = (
    <span className="inline-flex items-center gap-2">
      {badge}
      {rightIcon}
    </span>
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...a } = rest;
    return (
      <SidebarNavItem href={href} trailing={trailing} {...a}>
        {label}
      </SidebarNavItem>
    );
  }

  return (
    <SidebarNavItem trailing={trailing} {...rest}>
      {label}
    </SidebarNavItem>
  );
}

