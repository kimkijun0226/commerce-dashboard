# Cursor Commerce Dashboard - 프로젝트 가이드

> 프로젝트 구조, 폴더별 용도, 향후 개발 방향을 정리한 문서입니다.  
> PDF로 저장하려면: VS Code 확장 `Markdown PDF` 또는 브라우저에서 HTML 출력 후 인쇄 > PDF로 저장

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | cursor-commerce-dashboard |
| **성격** | 커머스 사용자 영역 + 관리자 대시보드 공존 |
| **기술 스택** | Next.js 16 (App Router), TypeScript, React 19, Tailwind CSS 4 |
| **패키지 매니저** | yarn |
| **기본 원칙** | Server Component 우선, 필요한 곳만 'use client', @/ alias 사용 |

---

## 2. 폴더 구조

```
cursor-commerce-dashboard/
├── app/                          # Next.js App Router (페이지·API·레이아웃)
│   ├── (auth)/                   # 인증 Route Group (URL에 (auth) 미포함)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (commerce)/               # 커머스 Route Group
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/[productId]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── account/page.tsx
│   ├── admin/                    # 관리자 영역
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── products/page.tsx
│   │   └── orders/page.tsx
│   ├── api/                      # API 라우트
│   │   └── products/
│   │       ├── route.ts
│   │       └── [productId]/route.ts
│   ├── _providers/               # 전역 Provider (URL 미포함)
│   │   └── ReactQueryProvider.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── favicon.ico
│
├── components/                   # UI 컴포넌트
│   ├── ui/                       # 공통 UI (버튼, 입력 등)
│   ├── commerce/                 # 커머스 전용 컴포넌트
│   │   └── types.ts
│   └── admin/                    # 관리자 전용 컴포넌트
│
├── commons/                      # 공통 리소스
│   ├── store/                    # 전역 상태 (세션, 장바구니)
│   │   ├── session-store.ts
│   │   ├── cart-store.ts
│   │   └── index.ts
│   ├── types/                    # 공통 타입
│   │   ├── product.ts
│   │   └── index.ts
│   ├── utils/                    # 유틸 함수
│   │   └── cn.ts
│   └── prompt/                   # 개발 참고용 프롬프트
│
├── features/                     # 기능별 도메인 로직
│   ├── products/
│   │   └── api/useProductsQuery.ts
│   └── orders/
│       └── api/
│           ├── useCreateOrderMutation.ts
│           └── types.ts
│
├── lib/                          # 외부 라이브러리 래퍼
│   ├── supabase/client.ts
│   └── auth/index.ts
│
├── types/                        # DB·외부 스키마 타입
│   └── supabase.ts
│
├── docs/                         # 문서
│   └── PROJECT_GUIDE.md
│
├── .cursor/rules/                # Cursor AI 규칙
├── package.json
├── tsconfig.json
├── next.config.ts
└── yarn.lock
```

---

## 3. 폴더별 사용 여부 및 용도

### 3.1 app/ (사용 중)

| 경로 | 사용 여부 | 용도 |
|------|----------|------|
| `layout.tsx` | ✅ 사용 중 | 루트 레이아웃, ReactQueryProvider, globals.css |
| `globals.css` | ✅ 사용 중 | Tailwind, CSS 변수, prefers-color-scheme 대응 |
| `(auth)/login` | ✅ 사용 중 | 로그인 페이지 placeholder |
| `(auth)/signup` | ✅ 사용 중 | 회원가입 페이지 placeholder |
| `(commerce)/layout` | ✅ 사용 중 | 커머스 공통 레이아웃(네비게이션 등) |
| `(commerce)/page` | ✅ 사용 중 | 커머스 메인(루트 `/`) placeholder |
| `(commerce)/products` | ✅ 사용 중 | 상품 목록 placeholder |
| `(commerce)/products/[productId]` | ✅ 사용 중 | 상품 상세 placeholder |
| `(commerce)/cart` | ✅ 사용 중 | 장바구니 placeholder |
| `(commerce)/checkout` | ✅ 사용 중 | 결제 placeholder |
| `(commerce)/account` | ✅ 사용 중 | 마이페이지 placeholder |
| `admin/` | ✅ 사용 중 | 관리자 레이아웃·대시보드·상품·주문 placeholder |
| `api/products` | ✅ 사용 중 | GET 목록·상세 API |
| `_providers/ReactQueryProvider` | ✅ 사용 중 | 클라이언트 Provider 래퍼(현재 children만 반환) |

### 3.2 components/ (부분 사용)

| 경로 | 사용 여부 | 용도 |
|------|----------|------|
| `ui/` | ⚪ placeholder | 공통 UI 컴포넌트(버튼, 인풋, 모달 등) |
| `commerce/` | ✅ 사용 중 | 커머스 전용 컴포넌트 + types.ts (Product, CartItem) |
| `admin/` | ⚪ placeholder | 관리자 전용 컴포넌트 |

### 3.3 commons/ (사용 중)

| 경로 | 사용 여부 | 용도 |
|------|----------|------|
| `store/session-store` | ✅ 사용 중 | UserRole, UserSession, SessionState, isUserSession |
| `store/cart-store` | ✅ 사용 중 | CartState (items: CartItem[]) |
| `store/index` | ✅ 사용 중 | 스토어 타입·가드 re-export |
| `types/product` | ✅ 사용 중 | ProductDetail, ProductCategory, isProductDetail |
| `types/index` | ✅ 사용 중 | 공통 타입 re-export |
| `utils/cn` | ✅ 사용 중 | Tailwind 클래스 병합 유틸 |
| `prompt/` | ⚪ 참고용 | 개발 시 참고할 mdc 프롬프트 |

### 3.4 features/ (사용 중)

| 경로 | 사용 여부 | 용도 |
|------|----------|------|
| `products/api/useProductsQuery` | ✅ 사용 중 | 상품 조회 훅 placeholder |
| `orders/api/useCreateOrderMutation` | ✅ 사용 중 | 주문 생성 뮤테이션 placeholder |
| `orders/api/types` | ✅ 사용 중 | CreateOrderInput, CreateOrderResult, isCreateOrderInput |

### 3.5 lib/ (placeholder)

| 경로 | 사용 여부 | 용도 |
|------|----------|------|
| `supabase/client` | ⚪ placeholder | Supabase 클라이언트 초기화 |
| `auth/` | ⚪ placeholder | 인증 유틸 |

### 3.6 types/ (부분 사용)

| 경로 | 사용 여부 | 용도 |
|------|----------|------|
| `supabase.ts` | ⚪ placeholder | Supabase 스키마 타입(DB 연동 시 확장) |

---

## 4. 라우트 매핑

| URL | 파일 | 비고 |
|-----|------|------|
| `/` | (commerce)/page.tsx | Route Group으로 URL에 commerce 미포함 |
| `/login` | (auth)/login/page.tsx | |
| `/signup` | (auth)/signup/page.tsx | |
| `/products` | (commerce)/products/page.tsx | |
| `/products/[id]` | (commerce)/products/[productId]/page.tsx | Dynamic Route |
| `/cart` | (commerce)/cart/page.tsx | |
| `/checkout` | (commerce)/checkout/page.tsx | |
| `/account` | (commerce)/account/page.tsx | |
| `/admin` | admin/page.tsx | |
| `/admin/products` | admin/products/page.tsx | |
| `/admin/orders` | admin/orders/page.tsx | |
| `/api/products` | api/products/route.ts | GET |
| `/api/products/[id]` | api/products/[productId]/route.ts | GET |

---

## 5. 타입 레이어 정리

| 레이어 | 위치 | 역할 |
|--------|------|------|
| 공통 타입 | commons/types/ | ProductDetail 등 도메인 공통 타입 |
| 스토어 타입 | commons/store/ | UserSession, SessionState, CartState |
| 컴포넌트 타입 | components/*/types.ts | 화면용 Product, CartItem 등 |
| 기능 타입 | features/*/api/types.ts | API 입출력 CreateOrderInput 등 |
| DB 타입 | types/supabase.ts | Supabase 스키마 (향후 확장) |

---

## 6. 향후 개발 방향

### 6.1 단기 (기반 작업)

1. **React Query 도입**  
   - ReactQueryProvider에 QueryClientProvider 연결  
   - useProductsQuery, useCreateOrderMutation 실제 구현  

2. **Supabase 연동**  
   - lib/supabase/client.ts 초기화  
   - types/supabase.ts에 DB 스키마 타입 정의  
   - 인증: lib/auth + session-store 연동  

3. **공통 UI 컴포넌트**  
   - components/ui에 Button, Input, Card 등 구현  

### 6.2 중기 (기능 구현)

1. **커머스 페이지**  
   - 상품 목록/상세/장바구니/결제 UI 구현  
   - ProductCard, OrderForm 등 commerce 컴포넌트  

2. **관리자 페이지**  
   - 상품 CRUD, 주문 관리 UI  
   - admin 전용 컴포넌트  

3. **인증 플로우**  
   - 로그인/회원가입 폼 및 Supabase Auth 연동  

### 6.3 장기 (확장)

1. **상태 관리**  
   - session-store, cart-store 실제 구현 (Zustand 등)  

2. **추가 API**  
   - 주문 생성, 사용자 관련 API  

3. **테스트**  
   - commons/prompt/ch2의 테스트·컴포넌트 프롬프트 참고  

---

## 7. 참고 규칙

- **.cursor/rules/01-common.mdc**: 기본 개발 원칙, 패키지 매니저 yarn, 주석 한국어  
- **.cursor/rules/02-git.mdc**: Conventional Commits, 주기적 커밋  
- **commons/prompt/ch3/**: 프로젝트 구조·타입 정의 참고용 mdc  

---

*문서 작성일: 2025-02*
