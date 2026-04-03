import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "../cn/cn";
import { typographyToStyle } from "../typography-styles/typography-styles";
import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> & {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      label,
      description,
      error,
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
    const invalid = Boolean(error);

    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            disabled={disabled}
            aria-describedby={error ? errId : undefined}
            className="mt-0.5 size-4 shrink-0 rounded border cursor-pointer disabled:cursor-not-allowed"
            style={{
              accentColor: commerceColors.primary.main,
              borderColor: invalid
                ? commerceColors.semantic.danger
                : commerceColors.border.default,
            }}
            {...rest}
          />
          {label ? (
            <div className="min-w-0 flex-1">
              <label
                htmlFor={id}
                className="cursor-pointer"
                style={{
                  ...typographyToStyle(commerceTypography.body2),
                  color: commerceColors.text.primary,
                }}
              >
                {label}
              </label>
              {description ? (
                <p
                  className="mt-0.5"
                  style={{
                    ...typographyToStyle(commerceTypography.caption2),
                    color: commerceColors.text.muted,
                  }}
                >
                  {description}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        {error ? (
          <p
            id={errId}
            role="alert"
            className="pl-7 text-sm"
            style={{ color: commerceColors.semantic.danger }}
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
