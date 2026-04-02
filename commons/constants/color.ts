// commons/constants/color.ts
// Figma(Commerce & Admin 템플릿)에서 추출한 디자인 토큰 - Color
//
// 사용 목적
// - 커머스(유저 UI)와 어드민(관리자 UI)의 색상 기준점을 한 곳에서 관리
// - 컴포넌트에서 직접 hex 값을 박는 대신, 의미 기반 토큰을 사용하도록 유도
//
// 참고(주요 소스)
// - Figma styles: Neutral/*, Blue/Green/Yellow/Red, Brand color 등
// - 템플릿 컴포넌트에서 실제 사용되는 값: #141718, #f3f5f7, #6c7275 등

// Commerce Color Palette
export const commerceColors = {
  // 커머스 UI에서 가장 많이 사용되는 기본 브랜드/잉크 컬러
  primary: {
    main: "#141718", // 버튼/아이콘/진한 텍스트에 자주 사용
    dark: "#121212", // 더 진한 텍스트/아이콘
    light: "#23262f", // 보조 진한 텍스트 톤(어두운 회색 계열)
  },

  // 기본 배경/서페이스 계열
  background: {
    default: "#ffffff", // 페이지 기본 배경
    paper: "#fefefe", // 카드/입력 등 흰 서페이스(미세한 톤 차)
    light: "#f3f5f7", // 플레이스홀더/라이트 서페이스
    elevated: "#e8ecef", // 구분선/라이트 컨테이너 톤(템플릿에서 자주 등장)
  },

  // 텍스트 계열
  text: {
    primary: "#141718", // 기본 본문/제목
    secondary: "#6c7275", // 보조 설명/서브 텍스트
    muted: "#99a1af", // 입력 placeholder 등 더 옅은 텍스트
    inverse: "#ffffff", // 다크 배경 위 텍스트
  },

  // 보더/디바이더 계열
  border: {
    subtle: "#e8ecef",
    default: "#cbcbcb",
    strong: "#6c7275",
  },

  // 상태/의미 색(알림/뱃지 등에 사용)
  semantic: {
    // Figma style: Blue (#377dff 근처)
    info: "#377dff",
    // Figma style: Green (#38cb89 근처)
    success: "#38cb89",
    // Figma style: Yellow (#ffab00)
    warning: "#ffab00",
    // Figma style: Red (#ff5630 근처)
    danger: "#ff5630",
  },

  // Figma Neutral 팔레트(필요 시 더 촘촘하게 확장 가능)
  neutral: {
    n01_100: "#fefefe",
    n02_100: "#f3f5f7",
    n03_100: "#e8ecef",
    n04_100: "#6c7275",
    n05_100: "#343839",
    n06_100: "#23262f",
    n07_100: "#141718",
  },
} as const;

// Admin Color Palette
export const adminColors = {
  // 어드민의 기본 텍스트/아이콘도 커머스와 같은 잉크 톤을 사용
  primary: {
    main: "#23272e", // Admin 템플릿의 기본 텍스트(메뉴/테이블)에서 확인
    dark: "#111827", // 제목/강조 텍스트
    light: "#374151", // 보조 텍스트 톤
  },

  // 어드민은 카드 기반 UI + 밝은 회색 배경을 사용
  background: {
    default: "#ffffff",
    paper: "#ffffff",
    light: "#f3f4f6", // 입력/서브 서페이스(설정 UI에서 확인)
    // 어드민 템플릿 프레임에서 배경 톤으로 확인된 값(디자인 보드 배경)
    gray: "#cac5cd",
  },

  text: {
    primary: "#23272e",
    secondary: "#8b909a", // 메뉴/서브 텍스트에 빈번
    muted: "#6b7280", // 설명 문구(설정 섹션)에서 확인
    inverse: "#ffffff",
  },

  border: {
    subtle: "#e5e7eb",
    default: "#dbdade",
    brandSubtle: "#e9e7fd", // 어드민 테이블/드롭다운 보더로 확인
  },

  // 어드민 전용 포인트(배지/강조)
  brand: {
    // Admin 템플릿 배지/포인트로 확인된 보라색 계열
    primary: "#7367f0",
    // on brand 배경 위 텍스트
    onPrimary: "#ffffff",
  },

  semantic: {
    info: "#2563eb", // 설정 카드(아이콘 영역)에서 확인
    success: "#28c76f", // "Active" 텍스트 색으로 확인
    warning: "#ffab00",
    danger: "#ff5630",
  },

  // 공용 Neutral 팔레트(커머스와 공유 가능)
  neutral: {
    n50: "#f9fafb",
    n100: "#f3f4f6",
    n200: "#e5e7eb",
    n300: "#d1d5db",
    n400: "#9ca3af",
    n500: "#6b7280",
    n600: "#4b5563",
    n700: "#374151",
    n800: "#1f2937",
    n900: "#111827",
  },
} as const;

