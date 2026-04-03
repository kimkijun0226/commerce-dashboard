import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

export type RadioRowProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> & {
  label: ReactNode;
  meta?: ReactNode;
};

export function RadioRow({
  label,
  meta,
  className,
  id: idProp,
  disabled,
  ...inputRest
}: RadioRowProps) {
  const genId = useId();
  const id = idProp ?? genId;

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded border px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--commerce-semantic-info)] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        className,
      )}
      style={{
        backgroundColor: commerceColors.background.light,
        borderColor: commerceColors.border.subtle,
        borderWidth: 1,
        borderStyle: "solid",
        minHeight: 52,
      }}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <input
          id={id}
          type="radio"
          disabled={disabled}
          className="size-[18px] shrink-0"
          style={{ accentColor: commerceColors.primary.dark }}
          {...inputRest}
        />
        <span
          style={{
            ...typographyToStyle(commerceTypography.body2),
            color: commerceColors.text.primary,
          }}
        >
          {label}
        </span>
      </span>
      {meta ? (
        <span
          className="shrink-0 tabular-nums"
          style={{
            ...typographyToStyle(commerceTypography.body2),
            color: commerceColors.text.primary,
          }}
        >
          {meta}
        </span>
      ) : null}
    </label>
  );
}
