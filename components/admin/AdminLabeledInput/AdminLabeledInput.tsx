"use client";

import { adminColors } from "@/commons/constants/color";
import { adminTypography } from "@/commons/constants/typography";
import { cn, typographyToStyle } from "@/components/ui";
import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

export type AdminLabeledInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  containerClassName?: string;
};

export function AdminLabeledInput({
  label,
  helperText,
  error,
  containerClassName,
  className,
  id: idProp,
  disabled,
  style,
  ...rest
}: AdminLabeledInputProps) {
  const genId = useId();
  const id = idProp ?? `${genId}-admin-input`;
  const helpId = `${id}-help`;
  const errId = `${id}-error`;

  const describedBy = [helperText ? helpId : null, error ? errId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={cn("flex w-full flex-col gap-2", containerClassName)}>
      <label
        htmlFor={id}
        style={{
          ...typographyToStyle(adminTypography.inputLabel),
          color: adminColors.text.primary,
        }}
      >
        {label}
      </label>

      <input
        id={id}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "w-full rounded-lg border px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-semantic-info)] disabled:opacity-60",
          className,
        )}
        style={{
          minHeight: 44,
          backgroundColor: adminColors.neutral.n100,
          borderColor: error ? adminColors.semantic.danger : "transparent",
          color: adminColors.text.primary,
          ...typographyToStyle(adminTypography.tableCell),
          ...style,
        }}
        {...rest}
      />

      {helperText ? (
        <p
          id={helpId}
          style={{
            ...typographyToStyle(adminTypography.helperText),
            color: adminColors.text.muted,
          }}
        >
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p
          id={errId}
          role="alert"
          style={{
            ...typographyToStyle(adminTypography.helperText),
            color: adminColors.semantic.danger,
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

