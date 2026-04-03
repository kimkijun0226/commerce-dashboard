import { adminColors, commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { SelectHTMLAttributes } from "react";
import { forwardRef, useId } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  options: readonly SelectOption[];
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      options,
      label,
      description,
      error,
      required,
      className,
      id: idProp,
      disabled,
      ...rest
    },
    ref,
  ) {
    const genId = useId();
    const id = idProp ?? genId;
    const errId = `${id}-error`;
    const descId = `${id}-description`;
    const invalid = Boolean(error);
    const describedBy = [description ? descId : null, error ? errId : null]
      .filter(Boolean)
      .join(" ") || undefined;

    const labelTypo = typographyToStyle(commerceTypography.caption2Semi);
    const descTypo = typographyToStyle(commerceTypography.caption2);
    const selectTypo = typographyToStyle(commerceTypography.body2);

    const chevron = adminColors.text.secondary;

    return (
      <div className={cn("flex w-full flex-col gap-1", className)}>
        {label ? (
          <label
            htmlFor={id}
            className="flex items-center gap-1"
            style={{
              ...labelTypo,
              color: commerceColors.text.secondary,
            }}
          >
            {label}
            {required ? (
              <span
                style={{ color: commerceColors.semantic.danger }}
                aria-hidden
              >
                *
              </span>
            ) : null}
            {required ? <span className="sr-only">필수 선택</span> : null}
          </label>
        ) : null}
        {description && !error ? (
          <p
            id={descId}
            style={{
              ...descTypo,
              color: commerceColors.text.muted,
            }}
          >
            {description}
          </p>
        ) : null}
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          required={required}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full min-h-10 min-w-0 cursor-pointer appearance-none rounded-md border py-2 pr-9 pl-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--commerce-semantic-info)] disabled:cursor-not-allowed disabled:opacity-50",
          )}
          style={{
            ...selectTypo,
            color: adminColors.text.primary,
            backgroundColor: commerceColors.background.default,
            borderColor: invalid
              ? commerceColors.semantic.danger
              : adminColors.border.default,
            borderWidth: 1,
            borderStyle: "solid",
            backgroundImage: `linear-gradient(45deg, transparent 50%, ${chevron} 50%), linear-gradient(135deg, ${chevron} 50%, transparent 50%)`,
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
        {error ? (
          <p
            id={errId}
            role="alert"
            className="text-sm"
            style={{ color: commerceColors.semantic.danger }}
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
