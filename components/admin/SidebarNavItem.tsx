import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type SidebarNavItemProps = {
  active?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  trailing?: ReactNode;
  className?: string;
} & (
  | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children">)
  | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "type">)
);

export function SidebarNavItem(props: SidebarNavItemProps) {
  const {
    active = false,
    icon,
    children,
    trailing,
    className,
    href,
    ...rest
  } = props;

  const typo = typographyToStyle(
    active ? adminTypography.menuItemActive : adminTypography.menuItem,
  );

  const content = (
    <>
      {icon ? (
        <span className="flex size-[22px] shrink-0 items-center justify-center">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
      <ChevronIcon />
    </>
  );

  const sharedClass = cn(
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-semantic-info)]",
    className,
  );

  const sharedStyle = {
    ...typo,
    color: active ? adminColors.text.primary : adminColors.text.secondary,
    backgroundColor: active ? adminColors.neutral.n100 : "transparent",
  };

  if (href !== undefined) {
    const a = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a
        href={href}
        className={sharedClass}
        style={sharedStyle}
        aria-current={active ? "page" : undefined}
        {...a}
      >
        {content}
      </a>
    );
  }

  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type="button"
      className={sharedClass}
      style={sharedStyle}
      aria-current={active ? "page" : undefined}
      {...b}
    >
      {content}
    </button>
  );
}

function ChevronIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      className="shrink-0 opacity-60"
      aria-hidden
    >
      <path
        d="M7 5l4 4-4 4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
