import Link from "next/link";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { checkAdminAccess } from "@/lib/auth/admin";
import { notFound } from "next/navigation";
export default async function NewProductPage() {
  if (!(await checkAdminAccess())) notFound();
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/admin/products" className="text-sm text-gray-500">
        ← 상품 목록
      </Link>
      <h1 className="text-2xl font-semibold">상품 등록</h1>
      <ProductEditor />
    </div>
  );
}
