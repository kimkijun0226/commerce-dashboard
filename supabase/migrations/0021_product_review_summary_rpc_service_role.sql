-- 리뷰 삭제 등으로 호출자에게 해당 상품 리뷰 행이 없을 때도, 서버(service_role)가 요약 JSON을 갱신할 수 있게 합니다.

CREATE OR REPLACE FUNCTION public.update_product_review_summary_for_reviewer(
  p_product_id uuid,
  p_review_summary jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count int;
BEGIN
  IF auth.role() = 'service_role' THEN
    UPDATE public.products p
    SET
      review_summary = p_review_summary,
      updated_at = now()
    WHERE p.id = p_product_id;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count = 0 THEN
      RAISE EXCEPTION 'product not found';
    END IF;
    RETURN;
  END IF;

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT public.is_admin() THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.reviews r
      WHERE r.product_id = p_product_id
        AND r.user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'forbidden';
    END IF;
  END IF;

  UPDATE public.products p
  SET
    review_summary = p_review_summary,
    updated_at = now()
  WHERE p.id = p_product_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count = 0 THEN
    RAISE EXCEPTION 'product not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.update_product_review_summary_for_reviewer(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_product_review_summary_for_reviewer(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_product_review_summary_for_reviewer(uuid, jsonb) TO service_role;
