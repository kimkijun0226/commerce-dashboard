# Admin 컴포넌트 추출/분석 (Figma: 310:2924)

- **Figma 노드**: `310:2924` (Admin 컴포넌트)
- **Figma 링크**: `https://www.figma.com/design/Bf68cY42dn4EXToW70Hkf2/Commerce---Admin-%ED%85%9C%ED%94%8C%EB%A6%BF--%EB%B3%B5%EC%82%AC-?node-id=310-2924&t=gxzK31M6WmtiZgAl-4`
- **분석 목적**
  - 화면에 등장하는 “어드민 서비스용 컴포넌트”를 **실제 노드 구성/텍스트/스타일 관찰 기반**으로 추출
  - 현재 프로젝트에 이미 존재하는 `components/admin/*` 컴포넌트와 비교해 **신규 필요/확장 포인트/Props/상태/토큰**을 설계

---

## 0) 현재 프로젝트의 기존 어드민 컴포넌트(입력값)

- `components/admin/AdminTable`: 제네릭 테이블
- `components/admin/AdminFilterBar`: 필터 바
- `components/admin/AdminMetricCard`: 지표 카드
- `components/admin/AdminStatusBadge`: 상태 배지
- `components/admin/AdminLayout`: 레이아웃
- `components/admin/AdminHeader`: 헤더
- `components/admin/AdminSidebar`: 사이드바
- `components/admin/AdminTablePagination`: 페이지네이션
- `components/admin/AdminTopbar`: 상단 바

---

## 1) Figma 디자인에 있는 컴포넌트 목록(관찰 기반)

아래는 `310:2924` 하위에서 관찰된 요소들을 “UI 역할” 기준으로 묶은 목록입니다.

### 1-1. Sidebar/Menu 영역

- **AdminSidebar(메뉴 컨테이너)**
  - 로고 영역: “Cursor Commerce”(Poppins 20) + 우측 아이콘(Indent/Collapse 느낌)
  - 섹션 라벨: “MAIN MENU”, “PRODUCTS”, “ADMIN”(Public Sans 11)
  - 네비 아이템(List): 아이콘(22) + 텍스트(15) + 우측 chevron + (일부) Badge(22)
  - 활성 항목 배경: `#f3f4f8` 계열, 텍스트는 더 진하게(세미볼드)

### 1-2. Filter/Search 영역(테이블 상단 필터)

- **AdminSearchInput**
  - placeholder: “Search by order id” (Public Sans 15, muted)
  - 우측에 돋보기 아이콘(18)
  - 컨테이너: radius 4, height 40
- **AdminSelect(드롭다운)**
  - placeholder: “Filter by date range”
  - 우측 chevron-down 아이콘(16)
  - 컨테이너: radius 6, height 40

### 1-3. Table 영역

- **AdminTableHeaderRow**
  - 컬럼 헤더: Product id/name/Price/Stock/Status
  - 타이포: Public Sans 13 Medium(대략 13/15.275)
  - row height: 47
  - 셀 경계: `#dbdade` 계열
- **AdminTableRow**
  - row height: 50
  - 셀 텍스트: Public Sans 15 Regular(15/22)
  - Status는 녹색 텍스트(Active: `#28c76f`)로 표현된 케이스가 존재

### 1-4. Pagination + PageSize 영역(테이블 하단)

- **AdminTableFooterRow**
  - “Showing” 텍스트 + page size 드롭다운(예: 10) + “of 50”
  - 우측 Pagination(28×28 셀, prev/next chevron)
  - Pagination active: 배경 `#141718`, 글자 흰색
  - Pagination inactive: 배경 `#f1f2f6`, 글자 `#8b909a`

### 1-5. Settings/Card 영역(설정 카드)

- **AdminSettingsCard(예: 실시간 매출 알림)**
  - 카드 컨테이너: bg white, border `#e5e7eb`, radius 12
  - 좌측 아이콘 배지(40×40, radius 8, bg `#eff6ff`)
  - 타이틀(Poppins 16 SemiBold), 설명(Poppins 14 Medium)
  - 우측 토글 스위치(44×24)
  - 라벨(Inter 14) + 인풋(1022×44, bg `#f3f4f6`, radius 8)
  - helper text(Inter 12 thin)

### 1-6. Toggle(Switch)

- **AdminToggleSwitch**
  - ON: 배경 `#1f2937`, thumb white(20×20)
  - OFF: 배경 `#e5e7eb`, thumb white(20×20)
  - radius: pill(9999)

---

## 2) 기존 컴포넌트와 비교 → 새로 필요한 컴포넌트

아래는 “현재 프로젝트에 있는 Admin 컴포넌트 목록” 기준으로, `310:2924` 화면 구현에 **직접적으로 추가로 필요**해 보이는 컴포넌트들입니다.

- **AdminSidebarNavItem**: 사이드바 `List` 단위(아이콘+라벨+우측 아이콘+badge+active bg)  
  - `AdminSidebar` 내부에서만 쓰는 private 컴포넌트로 두거나, 재사용 가능하면 public export로 분리

- **AdminSearchInput**: “Search by order id” 형태의 검색 인풋(아이콘 포함)  
  - `AdminFilterBar`에 slot 형태로 내장할 수도 있으나, Figma에 고정 패턴이 있으므로 컴포넌트화 추천

- **AdminSelect**: “Filter by date range” 드롭다운  
  - 기존 `AdminFilterBar`가 있다면, 내부 구성 요소로 확장 가능(= 신규 컴포넌트로 만들지 않고도 해결 가능)

- **AdminToggleSwitch**: ON/OFF pill 토글  
  - `AdminTopbar`에서 재사용 가능성이 높음(설정/권한/알림 등)

- **AdminSettingsCard**: 설정 카드(아이콘+타이틀/설명+토글+필드)  
  - `AdminMetricCard`와 용도가 다름(지표 vs 설정 폼) → 별도 필요

- **AdminLabeledInput**: 라벨+인풋+helper가 묶인 폼 필드  
  - 단품으로 만들어도 되고, `AdminSettingsCard` 내부 전용으로 만들어도 됨

---

## 3) 기존 컴포넌트를 확장해야 하는 부분

### 3-1. `AdminSidebar` 확장 포인트

- **active 상태**: 아이템 배경색(예: `#f3f4f8`) 및 텍스트 weight(Regular → SemiBold)
- **badge 지원**: 우측에 작게 붙는 Badge(22×22, 보라 계열 투명)
- **우측 아이콘**: `chevron-right` / `chevron-down` (서브메뉴 표현)
- **collapsed**: 좌측 메뉴 접힘(아이콘만 표시) 가능성
- **접근성**: 현재 활성 메뉴 `aria-current="page"`, 키보드 포커스 `:focus-visible`

### 3-2. `AdminTable` 확장 포인트

- **타이포 고정**: 헤더(Public Sans 13 Medium) / 바디(Public Sans 15 Regular)
- **row 높이 고정**: header 47, row 50
- **셀 border 색상 토큰화**: 반복되는 `#dbdade` 계열을 `--admin-border-default`로 흡수
- **상태 컬럼 표현**: 단순 텍스트(Active=green) 외에 `AdminStatusBadge`와의 매핑 고려
- **상태**: `loading`, `empty`, `row-hover`/`row-selected`(필요 시)

### 3-3. `AdminTablePagination` 확장 포인트

- **Page size 선택 + “Showing/of” 레이아웃**이 테이블 pagination UI에 함께 존재
- Pagination 셀 크기 28×28, active/inactive 색상 규칙
- `prev/next disabled` 처리(첫/마지막 페이지)

---

## 4) 컴포넌트별 Props 인터페이스 설계(초안)

아래는 구현/재사용 관점에서의 **권장 Props 스펙**입니다. (필요 시 더 줄이거나 slot을 늘려도 됨)

### 4-1. AdminSidebarNavItem (신규)

- **컴포넌트명**: AdminSidebarNavItem  
  - **설명**: 사이드바 단일 항목(아이콘+라벨+badge+chevron, active 배경)
  - **Props**
    - `label: ReactNode`
    - `icon?: ReactNode`
    - `active?: boolean`
    - `badge?: ReactNode`
    - `rightIcon?: ReactNode` (chevron 등)
    - `href?: string` / `onClick?: () => void`
    - `disabled?: boolean`
    - `className?: string`
  - **상태**: default / hover / active / focus-visible / disabled

### 4-2. AdminSearchInput (신규)

- **컴포넌트명**: AdminSearchInput  
  - **설명**: 우측 돋보기 아이콘 포함 검색 입력
  - **Props**
    - `value?: string`
    - `defaultValue?: string`
    - `onChange?: (value: string) => void`
    - `onSubmit?: (value: string) => void`
    - `placeholder?: string` (기본: Search by order id)
    - `disabled?: boolean`
    - `name?: string` (기본: "q")
    - `className?: string`
    - `aria-label?: string`
  - **상태**: default / focus-visible / disabled

### 4-3. AdminSelect (신규 또는 AdminFilterBar 확장)

- **컴포넌트명**: AdminSelect  
  - **설명**: chevron-down 포함 select
  - **Props**
    - `options: readonly { value: string; label: string }[]`
    - `value?: string`
    - `defaultValue?: string`
    - `onChange?: (value: string) => void`
    - `placeholder?: string` (기본: Filter by date range)
    - `disabled?: boolean`
    - `className?: string`
    - `aria-label?: string`
  - **상태**: default / open / focus-visible / disabled

### 4-4. AdminToggleSwitch (신규 또는 기존 Switch 재사용)

- **컴포넌트명**: AdminToggleSwitch  
  - **설명**: 44×24 pill switch (ON/OFF)
  - **Props**
    - `checked: boolean`
    - `onCheckedChange?: (next: boolean) => void`
    - `disabled?: boolean`
    - `label?: ReactNode` (옵션)
    - `labelId?: string` (옵션)
    - `className?: string`
  - **상태**: default / checked / focus-visible / disabled

### 4-5. AdminSettingsCard (신규)

- **컴포넌트명**: AdminSettingsCard  
  - **설명**: 설정 카드(타이틀/설명/아이콘/우측 토글 + 폼 필드 슬롯)
  - **Props**
    - `title: ReactNode`
    - `description?: ReactNode`
    - `icon?: ReactNode`
    - `enabled: boolean`
    - `onEnabledChange?: (next: boolean) => void`
    - `children?: ReactNode` (필드 슬롯)
    - `disabled?: boolean`
    - `className?: string`
  - **상태**: default / disabled(전체) / enabled 토글 on/off

### 4-6. AdminLabeledInput (신규 또는 내부 전용)

- **컴포넌트명**: AdminLabeledInput  
  - **설명**: 라벨 + 입력 + helper 텍스트
  - **Props**
    - `label: ReactNode`
    - `helperText?: ReactNode`
    - `value?: string`
    - `defaultValue?: string`
    - `onChange?: (value: string) => void`
    - `disabled?: boolean`
    - `inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]`
    - `name?: string`
    - `placeholder?: string`
    - `className?: string`
  - **상태**: default / focus-visible / disabled / (확장: error)

---

## 5) 사용되는 디자인 토큰(반드시 --admin-* prefix)

> 아래는 “관찰된 원본 색상/타이포/치수”를 프로젝트 토큰으로 매핑하기 위한 가이드입니다.

### 5-1. 색상 토큰(관찰 → 토큰 제안)

- `#ffffff` → `--admin-background-default`
- `#23272e`, `#111827`, `#1f2937` → `--admin-text-primary`, `--admin-neutral-n900`
- `#8b909a`, `#6b7280`, `#374151` → `--admin-text-secondary`, `--admin-text-muted`
- `#f3f4f8`, `#f1f2f6`, `#f3f4f6` → `--admin-neutral-n100` (톤 구분 필요 시 `n100/n150` 등으로 분리)
- `#e5e7eb`, `#dbdade` → `--admin-border-default`
- `#e9e7fd` → `--admin-border-brand-subtle`
- `#28c76f` → `--admin-semantic-success`
- `#eff6ff` → `--admin-semantic-info-bg` (아이콘 배경)
- `#2563eb` → `--admin-semantic-info` (아이콘 컬러)

### 5-2. 타이포 토큰(관찰 → 토큰 제안)

- Sidebar 메뉴/테이블: Public Sans
  - `--admin-typography-menuItem` (15/22, Regular)
  - `--admin-typography-menuItemActive` (15/22, SemiBold)
  - `--admin-typography-menuSectionLabel` (11/14)
  - `--admin-typography-tableHeader` (13/15.275, Medium)
  - `--admin-typography-tableCell` (15/22, Regular)
  - `--admin-typography-pagination` (13/20)
- Settings 카드:
  - `--admin-typography-cardTitle` (Poppins 16 SemiBold)
  - `--admin-typography-cardDescription` (Poppins 14 Medium)
  - `--admin-typography-inputLabel` (Inter 14 Regular)
  - `--admin-typography-helperText` (Inter 12 Thin)

### 5-3. 간격/라운드/사이즈(관찰 → 토큰 제안)

- radius
  - 드롭다운: 6 → `--admin-radius-6`
  - 입력/아이콘 배경: 8 → `--admin-radius-8`
  - 카드: 12 → `--admin-radius-12`
  - switch pill: 9999 → `--admin-radius-pill`
- sizes
  - pagination cell: 28×28 → `--admin-pagination-cell`
  - sidebar item height: 40 → `--admin-sidebar-item-height`
  - switch: 44×24, thumb 20×20 → `--admin-switch-width/height/thumb`

---

## 6) 컴포넌트 상태 정의(권장)

### 공통

- **default**
- **hover**: 배경/텍스트 약한 변화(특히 sidebar item, pagination cell)
- **focus-visible**: 키보드 포커스 링(`--admin-semantic-info` 또는 `--admin-focus-ring`)
- **disabled**: opacity/interaction off
- **loading**: 테이블/폼(필요 시)

### 컴포넌트별 포인트

- SidebarNavItem: `active`(배경 강조, 텍스트 세미볼드)
- Pagination cell: `active`(dark bg + white text), `disabled(prev/next)`
- ToggleSwitch: `checked`(on/off 배경)
- Form input: `focus-visible`, (확장) `error`

---

## 7) “결과 형식” 요약(요청 포맷)

- **AdminSidebar**: 좌측 사이드바(로고/섹션/아이템/뱃지/접힘) (기존/확장) [`items, activeKey, collapsed?, onNavigate, onToggleCollapse?`]
- **AdminSidebarNavItem**: 사이드바 단일 메뉴 아이템 (신규) [`label, icon?, active?, badge?, rightIcon?, href?/onClick?, disabled?`]
- **AdminSearchInput**: 주문번호 검색 인풋(돋보기 아이콘 포함) (신규) [`value?, defaultValue?, onChange?, onSubmit?, placeholder?, disabled?`]
- **AdminSelect**: 날짜 범위 필터 드롭다운 (신규/확장) [`options, value?, onChange?, placeholder?, disabled?`]
- **AdminTable**: 컬럼 헤더/행/셀 보더/상태 컬럼 포함 테이블 (기존/확장) [`columns, rows, rowKey, renderCell?, loading?, emptyState?`]
- **AdminTablePagination**: showing + pageSize + pagination 셀 (기존/확장) [`currentPage, totalPages, pageSize, pageSizeOptions, onPageChange, onPageSizeChange`]
- **AdminToggleSwitch**: 44×24 pill 스위치 (신규/확장) [`checked, onCheckedChange, disabled?, aria-label?`]
- **AdminSettingsCard**: 설정 카드(아이콘+설명+토글+필드) (신규) [`title, description?, icon?, enabled, onEnabledChange, children?, disabled?`]
- **AdminLabeledInput**: 라벨+인풋+helper 폼 필드 (신규) [`label, helperText?, value?/defaultValue?, onChange?, disabled?`]

---

## 8) 메모(범위/주의)

- 본 문서는 **`310:2924`에 포함된 패턴**만을 기준으로 작성되었습니다.
- 다른 Admin 화면 노드(예: Dashboard, Orders, Products)까지 범위를 확장하면 컴포넌트가 추가로 발견될 수 있습니다.

