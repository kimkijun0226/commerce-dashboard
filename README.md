# Commerce Dashboard

일반 커머스 영역(홈·상품·장바구니·체크아웃)과 **어드민 대시보드**를 한 저장소에서 다루는 프로젝트입니다. Next.js App Router 위에서 **Supabase(Postgres + Auth + RLS)** 를 붙였고, 화면은 Figma Commerce & Admin 템플릿을 기준으로 토큰·간격을 맞춰 두었습니다.

---

## 이 프로젝트에서 쓰는 것들

**프레임워크·언어:** Next.js 16(App Router), React 19, TypeScript, Tailwind CSS v4  

**데이터·인증:** Supabase(`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, `@supabase/ssr`), Postgres 마이그레이션·시드 스크립트(`pg`, `tsx`)  

**서버 상태(서버에서 가져온 데이터):** TanStack Query v5 — 루트 레이아웃의 `ReactQueryProvider`로 감싸고, 상품·검색·주문·리뷰 등은 `features/*/api`·`hooks`의 쿼리/뮤테이션 훅으로만 다루는 편입니다. 개발할 때는 Devtools로 캐시 상태를 봅니다.  

**클라이언트 상태(브라우저만의 UI·세션 메모리):** Zustand  
- **장바구니**(`commons/store/cart-store.ts`): `persist`로 **localStorage**에 `items`만 저장하고, 수량·합계는 항상 `items`에서 다시 계산해 데이터가 어긋나지 않게 했습니다.  
- **세션 표시용**(`commons/store/session-store.ts`): 로그인 사용자 스냅샷 등 **메모리 전용**(persist 없음). `isAdmin`은 `user.role`과 동기화합니다.  
- **검색 UI**(`features/search/store/searchStore.ts`): 모달 열림·키워드 같은 **순수 UI 상태**만 분리했습니다.  

**UI·문서:** 커머스/어드민 전용 컴포넌트는 `components/commerce`, `components/admin`, 공통 primitives는 `components/ui`. 토스트는 Sonner, 아이콘은 react-icons. 컴포넌트 단위 문서는 **Storybook 8**(`yarn storybook`).  

**결제:** 토스페이먼츠 플로우에 맞춘 체크아웃·주문 데이터(`toss_order_id` 등)와 `TossPayment` UI 래퍼 — 실제 SDK 호출은 상위에서 `onRequestPayment`로 주입하는 구조입니다.  

**디자인 워크플로:** **Talk to Figma MCP**로 노드·문서 정보를 읽고, `commons/constants/color.ts`, `typography.ts` 같은 토큰과 컴포넌트 주석에 Figma 노드 기준을 남겨 두었습니다.

---

## 폴더 구성(요약)

```
app/                    # App Router — 페이지·레이아웃·API
  (commerce)/           # 스토어 프론트(홈, 상품, 카트, 체크아웃 등)
  (auth)/               # 로그인·회원가입
  admin/                # 어드민 영역
  api/                  # Route Handlers
  _providers/           # React Query Provider 등
  actions/              # Server Actions (해당 시)

components/
  commerce/             # 스토어 전용 블록(카드, PDP, 장바구니, 토스 결제 UI 등)
  admin/                # 어드민 전용
  ui/                   # 버튼·입력·페이지네이션 등 공통 UI

features/               # 도메인 단위(화면과 느슨하게 결합)
  products/             # api/, hooks/ — 상품 목록·상세·리뷰 요약 등
  search/               # 검색 API·홈 검색바·searchStore
  orders/               # 주문 생성 뮤테이션 등
  reviews/              # 리뷰 조회 등

commons/                # 여러 레이어에서 공통으로 쓰는 것
  config/               # env 검증(getPublicEnv / getServerEnv)
  constants/            # Figma 기준 컬러·타이포·URL 등
  store/                # Zustand(장바구니·세션)
  utils/, hooks/, types/

lib/
  supabase/             # server.ts(쿠키), browser.ts(auth-helpers), client.ts 등
  auth/

types/
  supabase.ts           # DB 타입(Database 제네릭)

supabase/migrations/    # SQL 마이그레이션
scripts/                # 마이그레이션 실행, 시드, 컬럼 보장 스크립트
docs/                   # Supabase 설정 등 보조 문서
.storybook/             # Storybook 설정·Next mock
```

**왜 이렇게 나눴냐면:** `app`은 라우팅과 데이터 경계만 얇게 두고, **재사용 UI는 `components`**, **“이 도메인에서만 쓰는 fetch/훅”은 `features`** 로 모아서 페이지가 비대해지지 않게 했습니다. Supabase 타입은 `types/supabase` 한곳에서 임포트해 **테이블 스키마와 프론트 타입을 맞춥니다.**

---

## Supabase 클라이언트

- **서버(RSC, Route Handler, Server Action):** `lib/supabase/server.ts` — `createServerClient` + `cookies()` 로 세션을 읽고 갱신합니다.  
- **브라우저(쿠키 기반, 서버와 세션 맞추기):** `lib/supabase/browser.ts` — `createBrowserClient` + `getPublicEnv()`의 `NEXT_PUBLIC_*` 만 사용합니다.  
- **레거시/대안:** `lib/supabase/client.ts` 는 `@supabase/supabase-js` 직접 생성(localStorage 세션) — 용도에 따라 선택합니다.  

환경 변수 규칙과 필수 키는 `commons/config/env.ts`를 기준으로 합니다.

---

## 스크립트

```bash
yarn dev
yarn build
yarn start
yarn lint

yarn storybook
yarn build-storybook

yarn db:run-migration
yarn db:ensure-detail-images
yarn db:seed
yarn db:seed-reviews
yarn db:run-rls
```

마이그레이션은 `.env.local`에 `DATABASE_URL`(Supabase Dashboard → Database → URI)을 두거나, `SUPABASE_ACCESS_TOKEN` + `NEXT_PUBLIC_SUPABASE_URL` 조합으로 실행할 수 있습니다. 자세한 내용은 `docs/SUPABASE_SETUP.md`를 보세요.

---

## 로컬에서 돌리기

```bash
yarn install
yarn dev
```

[http://localhost:3000](http://localhost:3000) — `.env.local`에 Supabase 공개 키·URL이 있어야 인증·데이터 호출이 동작합니다.
