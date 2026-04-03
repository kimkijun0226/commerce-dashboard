import type { TypographyToken } from "@/commons/constants/typography";
import type { CSSProperties } from "react";

export function typographyToStyle(token: TypographyToken): CSSProperties {
  return {
    fontFamily: token.fontFamily,
    fontWeight: token.fontWeight,
    fontSize: token.fontSize,
    lineHeight: `${token.lineHeightPx}px`,
    letterSpacing:
      token.letterSpacing !== undefined
        ? `${token.letterSpacing}px`
        : undefined,
  };
}
