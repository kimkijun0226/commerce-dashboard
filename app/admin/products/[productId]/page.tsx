import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  if (!(await checkAdminAccess())) notFound();
  const { productId } = await params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      productId,
    )
  )
    notFound();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) notFound();
  const saved = (await searchParams).saved;
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/admin/products" className="text-sm text-gray-500">
        ← 상품 목록
      </Link>
      <h1 className="text-2xl font-semibold">상품 수정</h1>
      {saved ? (
        <p
          role="status"
          className="border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          상품이 저장되었습니다. 쇼핑몰에 반영했습니다.
        </p>
      ) : null}
      <ProductEditor product={data} />
    </div>
  );
}
