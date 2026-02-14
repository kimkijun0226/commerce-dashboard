# Supabase 환경설정 및 클라이언트 가이드

> Supabase env 분리, 브라우저/서버 클라이언트 분리의 의미와 실제 사용 방법을 정리한 문서입니다.

---

## 1. 왜 브라우저와 서버를 나누는가?

### 1.1 실행 환경의 차이

| 구분 | 브라우저 (클라이언트) | 서버 (Node.js) |
|------|----------------------|----------------|
| **실행 시점** | 사용자 브라우저에서 JS 실행 | Next.js 서버(빌드·렌더링) |
| **세션 저장** | localStorage, cookies | cookies만 (서버는 localStorage 없음) |
| **환경변수** | `NEXT_PUBLIC_*` 만 노출 | 모든 env 접근 가능 |
| **보안** | 공개 URL·키만 사용 | secretKey 등 민감 정보 사용 가능 |

### 1.2 분리하는 이유

1. **세션·쿠키 처리 방식이 다름**
   - 브라우저: Supabase Auth가 `localStorage`에 세션 저장, PKCE 기반 인증
   - 서버: `cookies`를 통해 세션 읽기·갱신, SSR 시 동일 세션 유지

2. **보안**
   - 브라우저에는 `publishableKey`(anon key)만 노출
   - `secretKey`는 서버에서만 사용 (Admin API, RLS 우회 등)

3. **적재적소 사용**
   - 클라이언트 컴포넌트 → 브라우저 클라이언트
   - Server Component, API Route, Server Action → 서버 클라이언트

---

## 2. 환경변수 구조

### 2.1 파일 구조

```
commons/config/env.ts
├── getPublicEnv()   → 클라이언트/서버 모두 사용 (NEXT_PUBLIC_*)
└── getServerEnv()   → 서버 전용 (secretKey 포함)
```

### 2.2 Public vs Server

| 함수 | 용도 | 포함 항목 |
|------|------|-----------|
| `getPublicEnv()` | 브라우저 + 서버 | `supabase.url`, `supabase.publishableKey`, `siteUrl` |
| `getServerEnv()` | 서버만 | 위 + `supabase.secretKey` |

### 2.3 환경변수 예시 (.env.local)

```env
# 공개 (브라우저에 노출 가능)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbG... (anon key)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 비공개 (서버 전용, 절대 브라우저에 노출 금지)
SUPABASE_SECRET_KEY=eyJhbG... (service_role key)
```

---

## 3. 클라이언트 분리

### 3.1 브라우저 클라이언트 (lib/supabase/client.ts)

```typescript
getSupabaseBrowserClient() → SupabaseClient<Database>
```

| 항목 | 내용 |
|------|------|
| **패키지** | `@supabase/supabase-js` |
| **실행 위치** | 브라우저 (클라이언트 컴포넌트) |
| **세션** | localStorage 기반, PKCE flow |
| **캐싱** | 싱글톤으로 한 번만 생성 |

**사용 시점**

- `'use client'` 컴포넌트에서 Auth (로그인/로그아웃)
- React Query 등으로 상품·장바구니 데이터 fetch
- 실시간 구독 (realtime)

### 3.2 서버 클라이언트 (lib/supabase/server.ts)

```typescript
createClient() → Promise<SupabaseClient<Database>>
```

| 항목 | 내용 |
|------|------|
| **패키지** | `@supabase/auth-helpers-nextjs` |
| **실행 위치** | 서버 (Server Component, API Route, Server Action) |
| **세션** | `cookies()`로 읽기·갱신 |
| **캐싱** | 호출 시마다 새 인스턴스 (요청별 isolation) |

**사용 시점**

- Server Component에서 상품 목록 등 초기 데이터 fetch
- API Route에서 DB 조회·수정
- Server Action에서 주문 생성 등

---

## 4. 사용 예시

### 4.1 브라우저 클라이언트 (로그인)

```tsx
// app/(auth)/login/page.tsx 또는 로그인 폼 컴포넌트
"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const supabase = getSupabaseBrowserClient();

  async function handleLogin() {
    await supabase.auth.signInWithOtp({ email });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">로그인</button>
    </form>
  );
}
```

### 4.2 브라우저 클라이언트 (상품 조회 - React Query)

```tsx
// features/products/api/useProductsQuery.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useProductsQuery() {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
  });
}
```

### 4.3 서버 클라이언트 (Server Component)

```tsx
// app/(commerce)/products/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("status", "registered");

  return (
    <div>
      {data?.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

### 4.4 서버 클라이언트 (API Route)

```ts
// app/api/products/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

### 4.5 서버 클라이언트 (Server Action)

```ts
// features/orders/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import type { CreateOrderInput } from "./api/types";

export async function createOrder(input: CreateOrderInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다");

  const { data, error } = await supabase
    .from("orders")
    .insert({ user_id: user.id, items: input.items })
    .select("id")
    .single();

  if (error) throw error;
  return { orderId: data.id };
}
```

---

## 5. 선택 가이드

| 상황 | 사용할 클라이언트 |
|------|-------------------|
| `'use client'` 컴포넌트 | `getSupabaseBrowserClient()` |
| Server Component | `await createClient()` |
| API Route (route.ts) | `await createClient()` |
| Server Action ('use server') | `await createClient()` |
| 미들웨어 | `createServerClient` + `cookies` (별도 설정) |

---

## 6. 참고

- `Database` 타입: `types/supabase.ts`에 정의되어 있어 자동완성·타입 체크 지원
- `getServerEnv()`: Admin API 등 `service_role` 키가 필요할 때 사용
- 세션 갱신: 두 클라이언트 모두 Auth 설정으로 자동 갱신 처리
