# Cursor Commerce Dashboard

커머스 스토어·어드민 대시보드를 포함한 **Next.js** 기반 프로젝트입니다.

## 기술 스택

| 구분 | 사용 기술 |
|------|-----------|
| **프레임워크** | [Next.js](https://nextjs.org) 16 (App Router), [React](https://react.dev) 19 |
| **언어** | [TypeScript](https://www.typescriptlang.org) |
| **스타일** | [Tailwind CSS](https://tailwindcss.com) v4, `@tailwindcss/postcss` |
| **백엔드 / DB** | [Supabase](https://supabase.com) — `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, `@supabase/ssr` (인증·Postgres·RLS) |
| **서버 데이터 패칭** | [TanStack Query](https://tanstack.com/query) (`@tanstack/react-query` v5, 개발 시 Devtools) |
| **클라이언트 상태** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **UI·피드백** | [Sonner](https://sonner.emilkowal.ski/) (토스트), [React Icons](https://react-icons.github.io/react-icons/) |
| **컴포넌트 문서** | [Storybook](https://storybook.js.org) 8 (`@storybook/nextjs` 등) |
| **결제** | **토스페이먼츠(Toss Payments)** — 체크아웃·주문 흐름 및 `toss_order_id` 등 스키마 연동, 결제 UI 래퍼 컴포넌트 |
| **품질** | ESLint 9 + `eslint-config-next` |
| **DB 스크립트** | `pg`, `tsx`, `dotenv` — 마이그레이션·시드 |

### 디자인 · Figma MCP

- **Figma**: Commerce & Admin 템플릿 기준으로 컬러·타이포 등 토큰과 컴포넌트 스펙을 맞춤 (`commons/constants/color.ts`, `typography.ts` 등).
- **Cursor MCP**: **Talk to Figma** 연결로 노드 정보·문서 구조를 읽고 구현에 반영 (로컬 Cursor MCP 설정에서 사용).

## 스크립트

```bash
yarn dev              # 개발 서버
yarn build            # 프로덕션 빌드
yarn start            # 프로덕션 실행
yarn lint             # ESLint

yarn storybook        # Storybook (http://localhost:6006)
yarn build-storybook  # Storybook 정적 빌드

# Supabase / DB
yarn db:run-migration      # supabase/migrations 순차 적용
yarn db:ensure-detail-images  # products.detail_image_urls 컬럼 보장
yarn db:seed               # 상품 시드
yarn db:seed-reviews       # 리뷰 시드
yarn db:run-rls            # RLS 관련 스크립트
```

## 환경 변수

`.env.local` 예시는 `commons/config/env.ts`의 `getPublicEnv` / `getServerEnv` 기준입니다.

- **필수(공개)**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`(선택 시 기본 localhost)
- **서버 전용**: `SUPABASE_SECRET_KEY` 등
- **마이그레이션**: `DATABASE_URL`(URI) 또는 `SUPABASE_ACCESS_TOKEN` + 위 Supabase URL

자세한 Supabase 설정은 `docs/SUPABASE_SETUP.md`를 참고하세요.

## 로컬 실행

```bash
yarn install
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

---

Next.js 기본 템플릿에서 확장된 프로젝트이며, 배포는 [Vercel](https://vercel.com) 등 Next.js 호스팅에 맞게 구성할 수 있습니다.
