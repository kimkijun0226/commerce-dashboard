"use client";

// 관리자 수동 재생성을 가장 단순한 형태로 제공하는 기본 버튼입니다.
import { generateAiReviewSummary } from "@/app/(commerce)/products/[productId]/review-summary-actions";
import { useSessionStore } from "@/commons/store/session-store";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";

export type RegenerateReviewSummaryButtonProps = {
  isAdmin: boolean;
  productId: string;
  onSuccess?: () => void;
};

// 재생성 완료 후 부모가 reloadKey나 refresh를 이어서 처리할 수 있게 콜백을 노출합니다.
export function RegenerateReviewSummaryButton({
  isAdmin,
  productId,
  onSuccess,
}: RegenerateReviewSummaryButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const sessionIsAdmin = useSessionStore((s) => s.isAdmin);
  const effectiveAdmin = useMemo(
    () => isAdmin || sessionIsAdmin,
    [isAdmin, sessionIsAdmin],
  );

  if (!effectiveAdmin) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="shrink-0 rounded-full px-4 text-xs font-medium sm:text-sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            const result = await generateAiReviewSummary(productId);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("AI 리뷰 요약이 갱신되었습니다.");
            onSuccess?.();
            router.refresh();
          } catch (e) {
            console.error("[RegenerateReviewSummaryButton]", e);
            toast.error("요약 생성 중 오류가 발생했습니다.");
          }
        })
      }
      style={{ fontFamily: "var(--commerce-font-label)" }}
    >
      {isPending ? "재생성 중..." : "요약 다시 생성"}
    </Button>
  );
}
