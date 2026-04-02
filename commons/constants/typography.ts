// commons/constants/typography.ts
// Figma(Commerce & Admin 템플릿)에서 추출한 디자인 토큰 - Typography
//
// 설계 의도
// - 커머스는 Poppins(헤드라인) + Inter(본문/버튼) 조합
// - 어드민은 Public Sans(관리 UI 텍스트) + 일부 Poppins(타이틀) 조합이 관찰됨
// - 실제 구현 시 Tailwind/Style 시스템에 매핑하기 좋은 구조로 정리

export type TypographyToken = {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeightPx: number;
  letterSpacing?: number;
};

// Commerce Typography
export const commerceTypography = {
  // Headline 계열(Poppins Medium)
  hero: {
    fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: 96,
    lineHeightPx: 96,
  },
  headline1: { fontFamily: "Poppins", fontWeight: 500, fontSize: 80, lineHeightPx: 80 },
  headline2: { fontFamily: "Poppins", fontWeight: 500, fontSize: 72, lineHeightPx: 72 },
  headline3: { fontFamily: "Poppins", fontWeight: 500, fontSize: 54, lineHeightPx: 54 },
  headline4: { fontFamily: "Poppins", fontWeight: 500, fontSize: 40, lineHeightPx: 40 },
  headline5: { fontFamily: "Poppins", fontWeight: 500, fontSize: 34, lineHeightPx: 34 },
  headline6: { fontFamily: "Poppins", fontWeight: 500, fontSize: 28, lineHeightPx: 28 },
  headline7: { fontFamily: "Poppins", fontWeight: 500, fontSize: 20, lineHeightPx: 20 },

  // Body 계열(Inter)
  body1: { fontFamily: "Inter", fontWeight: 400, fontSize: 20, lineHeightPx: 26 },
  body1Semi: { fontFamily: "Inter", fontWeight: 600, fontSize: 20, lineHeightPx: 26 },
  body1Bold: { fontFamily: "Inter", fontWeight: 700, fontSize: 20, lineHeightPx: 26 },

  body2: { fontFamily: "Inter", fontWeight: 400, fontSize: 16, lineHeightPx: 26 },
  body2Semi: { fontFamily: "Inter", fontWeight: 600, fontSize: 16, lineHeightPx: 26 },
  body2Bold: { fontFamily: "Inter", fontWeight: 700, fontSize: 16, lineHeightPx: 26 },

  // Caption(Inter)
  caption1: { fontFamily: "Inter", fontWeight: 400, fontSize: 14, lineHeightPx: 20 },
  caption1Semi: { fontFamily: "Inter", fontWeight: 600, fontSize: 14, lineHeightPx: 20 },
  caption1Bold: { fontFamily: "Inter", fontWeight: 700, fontSize: 14, lineHeightPx: 20 },

  caption2: { fontFamily: "Inter", fontWeight: 400, fontSize: 12, lineHeightPx: 16 },
  caption2Semi: { fontFamily: "Inter", fontWeight: 600, fontSize: 12, lineHeightPx: 16 },
  caption2Bold: { fontFamily: "Inter", fontWeight: 700, fontSize: 12, lineHeightPx: 16 },

  // Hairline(Inter Bold)
  hairline1: { fontFamily: "Inter", fontWeight: 700, fontSize: 16, lineHeightPx: 16 },
  hairline2: { fontFamily: "Inter", fontWeight: 700, fontSize: 12, lineHeightPx: 12 },

  // Button(Inter Medium)
  buttonXL: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 26,
    lineHeightPx: 32,
    letterSpacing: -0.4,
  },
  buttonL: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 22,
    lineHeightPx: 28,
    letterSpacing: -0.4,
  },
  buttonM: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 18,
    lineHeightPx: 28,
    letterSpacing: -0.4,
  },
  buttonS: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 16,
    lineHeightPx: 28,
    letterSpacing: -0.4,
  },
  buttonXS: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 14,
    lineHeightPx: 20,
    letterSpacing: -0.4,
  },
} as const satisfies Record<string, TypographyToken>;

// Admin Typography
export const adminTypography = {
  // Admin 템플릿에서 관찰된 Public Sans 기반 토큰(메뉴/테이블/UI)
  menuItem: { fontFamily: "Public Sans", fontWeight: 400, fontSize: 15, lineHeightPx: 22 },
  menuItemActive: { fontFamily: "Public Sans", fontWeight: 600, fontSize: 15, lineHeightPx: 22 },
  menuSectionLabel: { fontFamily: "Public Sans", fontWeight: 400, fontSize: 11, lineHeightPx: 14 },

  tableHeader: { fontFamily: "Public Sans", fontWeight: 500, fontSize: 13, lineHeightPx: 15.275 },
  tableCell: { fontFamily: "Public Sans", fontWeight: 400, fontSize: 15, lineHeightPx: 22 },

  pagination: { fontFamily: "Public Sans", fontWeight: 400, fontSize: 13, lineHeightPx: 20 },

  // 설정/폼 영역에서 관찰된 Poppins/Inter 조합(카드 제목/설명)
  cardTitle: { fontFamily: "Poppins", fontWeight: 600, fontSize: 16, lineHeightPx: 24 },
  cardDescription: { fontFamily: "Poppins", fontWeight: 500, fontSize: 14, lineHeightPx: 20 },

  inputLabel: { fontFamily: "Inter", fontWeight: 400, fontSize: 14, lineHeightPx: 20 },
  helperText: { fontFamily: "Inter", fontWeight: 100, fontSize: 12, lineHeightPx: 16 },
} as const satisfies Record<string, TypographyToken>;

