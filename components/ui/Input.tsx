import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { InputHTMLAttributes } from "react";
import { forwardRef, useId } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  variant?: "default" | "underline";
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    description,
    error,
    required,
    variant = "default",
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
  const errId = `${id}-error`;
  const descId = `${id}-description`;
  const invalid = Boolean(error) || ariaInvalid === true;
  const describedBy = [description ? descId : null, error ? errId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  const labelStyle = typographyToStyle(commerceTypography.caption2Semi);
  const descStyle = typographyToStyle(commerceTypography.caption2);
  const inputTypo = typographyToStyle(commerceTypography.body2);

  const isUnderline = variant === "underline";

  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="flex items-center gap-1"
          style={{
            ...labelStyle,
            color: commerceColors.text.secondary,
          }}
        >
          {label}
          {required ? (
            <span style={{ color: commerceColors.semantic.danger }} aria-hidden>
              *
            </span>
          ) : null}
          {required ? (
            <span className="sr-only">필수 입력</span>
          ) : null}
        </label>
      ) : null}
      {description && !error ? (
        <p
          id={descId}
          style={{
            ...descStyle,
            color: commerceColors.text.muted,
          }}
        >
          {description}
        </p>
      ) : null}
      <input
        ref={ref}
        id={id}
        disabled={disabled}
        required={required}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full min-h-10 px-3 py-2 transition-shadow disabled:cursor-not-allowed disabled:opacity-60",
          isUnderline
            ? "rounded-none border-0 border-b bg-transparent px-0 focus-visible:ring-0"
            : "rounded-md border",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--commerce-semantic-info)]",
        )}
        style={{
          ...inputTypo,
          color: commerceColors.text.primary,
          backgroundColor: isUnderline
            ? "transparent"
            : commerceColors.background.default,
          borderColor: invalid
            ? commerceColors.semantic.danger
            : isUnderline
              ? commerceColors.border.default
              : commerceColors.border.default,
          borderBottomWidth: isUnderline ? 2 : undefined,
          borderTopWidth: isUnderline ? 0 : 1,
          borderLeftWidth: isUnderline ? 0 : 1,
          borderRightWidth: isUnderline ? 0 : 1,
        }}
        {...rest}
      />
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
});
