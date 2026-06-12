"use client";

// 기존 관리자용 재생성 버튼입니다. 새 Retry 버튼과 별도로 단순 갱신 흐름에 사용됩니다.
import { generateAiReviewSummary } from "@/app/(commerce)/products/[productId]/review-summary-actions";
import { useSessionStore } from "@/commons/store/session-store";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export type RegenerateSummaryButtonProps = {
  isAdmin: boolean;
  productId: string;
  /** 요약 갱신 후 부모에서 리스트를 다시 불러올 때 사용 */
  onSuccess?: () => void;
};

/**
 * 관리자 전용: AI 리뷰 요약을 서버에서 다시 생성합니다.
 */
export function RegenerateSummaryButton({
  isAdmin,
  productId,
  onSuccess,
}: RegenerateSummaryButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const sessionIsAdmin = useSessionStore((s) => s.isAdmin);
  const effectiveAdmin = useMemo(
    () => isAdmin || sessionIsAdmin,
    [isAdmin, sessionIsAdmin],
  );

  // 버튼 클릭 시 서버 재생성을 호출하고, 성공 후 부모와 라우터를 다시 갱신합니다.
  const handleClick = useCallback(async () => {
    setPending(true);
    try {
      const result = await generateAiReviewSummary(productId);
      if (result.ok) {
        toast.success("AI 리뷰 요약이 갱신되었습니다.");
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      console.error("[RegenerateSummaryButton]", e);
      toast.error("요약 생성 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }, [onSuccess, productId, router]);

  if (!effectiveAdmin) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="shrink-0 rounded-full px-4 text-xs font-medium sm:text-sm"
      disabled={pending}
      onClick={() => void handleClick()}
      style={{ fontFamily: "var(--commerce-font-label)" }}
    >
      {pending ? "생성 중…" : "요약 다시 생성"}
    </Button>
  );
}
