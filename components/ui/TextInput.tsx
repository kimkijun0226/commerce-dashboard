import { adminColors, commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { InputHTMLAttributes } from "react";
import { forwardRef, useId } from "react";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  /** 커머스 폼 vs 어드민 폼 톤 */
  tone?: "commerce" | "admin";
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      label,
      error,
      tone = "commerce",
      className,
      id: idProp,
      disabled,
      "aria-invalid": ariaInvalid,
      ...rest
    },
    ref,
  ) {
    const genId = useId();
    const id = idProp ?? genId;
    const errorId = `${id}-error`;
    const labelStyle = typographyToStyle(commerceTypography.caption2Bold);
    const colors =
      tone === "admin"
        ? {
            label: adminColors.text.secondary,
            border: adminColors.border.default,
            bg: adminColors.background.default,
            text: adminColors.text.primary,
            placeholder: adminColors.text.secondary,
            error: adminColors.semantic.danger,
          }
        : {
            label: commerceColors.text.secondary,
            border: commerceColors.border.default,
            bg: commerceColors.background.default,
            text: commerceColors.text.primary,
            placeholder: commerceColors.text.secondary,
            error: commerceColors.semantic.danger,
          };

    const invalid = Boolean(error) || ariaInvalid === true;

    return (
      <div className={cn("flex w-full flex-col gap-1", className)}>
        {label ? (
          <label
            htmlFor={id}
            className="block"
            style={{
              ...labelStyle,
              color: colors.label,
            }}
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full rounded-md px-3 py-2 transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-60",
            tone === "commerce"
              ? "focus-visible:outline-[var(--commerce-semantic-info)]"
              : "focus-visible:outline-[var(--admin-semantic-info)]",
          )}
          style={{
            ...typographyToStyle(commerceTypography.body2),
            height: 40,
            backgroundColor: colors.bg,
            color: colors.text,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: invalid ? colors.error : colors.border,
          }}
          {...rest}
        />
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-sm"
            style={{ color: colors.error }}
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
