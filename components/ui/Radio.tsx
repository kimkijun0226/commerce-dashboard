import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/components/ui/cn";
import { typographyToStyle } from "@/components/ui/typography-styles";
import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";

export type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> & {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
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

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={id}
          type="radio"
          disabled={disabled}
          aria-describedby={error ? errId : undefined}
          className="mt-1 size-4 shrink-0 cursor-pointer disabled:cursor-not-allowed"
          style={{
            accentColor: commerceColors.primary.dark,
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
});
