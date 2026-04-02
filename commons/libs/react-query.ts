import { QueryClient } from "@tanstack/react-query";

/**
 * React Query 전역 기본 설정
 *
 * - staleTime: 1분(60초) 동안은 "신선한 데이터"로 간주
 * - refetchOnWindowFocus: 창 포커스 시 자동 refetch 비활성화
 * - retry: 네트워크/일시적 실패에 대해 1회만 재시도
 */
export const reactQueryDefaultOptions: ConstructorParameters<typeof QueryClient>[0] =
  {
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  };

export function createQueryClient() {
  return new QueryClient(reactQueryDefaultOptions);
}

