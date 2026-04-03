import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";

export type DropdownOption = {
  value: string;
  label: string;
};

export type DropdownProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  options: readonly DropdownOption[];
  /** false면 보더 숨김(Figma 필터 변형) */
  bordered?: boolean;
};

export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  function Dropdown(
    { options, className, bordered = true, disabled, id, ...rest },
    ref,
  ) {
    const typo = typographyToStyle({
      ...adminTypography.menuItem,
      fontWeight: 500,
    });

    return (
      <select
        ref={ref}
        id={id}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        className={cn(
          "w-full min-w-0 cursor-pointer appearance-none rounded-md bg-transparent py-2 pr-8 pl-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--admin-semantic-info)] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        style={{
          ...typo,
          height: 40,
          color: adminColors.text.secondary,
          borderWidth: bordered ? 1 : 0,
          borderStyle: "solid",
          borderColor: bordered ? adminColors.border.brandSubtle : "transparent",
          backgroundColor: adminColors.background.default,
          backgroundImage: `linear-gradient(45deg, transparent 50%, ${adminColors.text.secondary} 50%), linear-gradient(135deg, ${adminColors.text.secondary} 50%, transparent 50%)`,
          backgroundPosition:
            "calc(100% - 14px) calc(50% - 3px), calc(100% - 9px) calc(50% - 3px)",
          backgroundSize: "5px 5px, 5px 5px",
          backgroundRepeat: "no-repeat",
        }}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  },
);
