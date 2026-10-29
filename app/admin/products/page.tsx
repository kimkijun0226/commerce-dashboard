import { parseProductOptions } from "@/commons/utils/productOptions";
import { getProductDisplayName } from "@/commons/utils/productDisplay";
import { notFound } from "next/navigation";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { saveProductKeywords } from "./actions";

export default async function AdminProductsPage() {
  if (!(await checkAdminAccess())) notFound();
  const supabase = await createClient();
  const { data, error } = await supabase.from("products")
    .select("id, name, department, search_keywords, options").order("created_at", { ascending: false });
  if (error) throw new Error(`상품 조회 실패: ${error.message}`);
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-xl font-bold">매장 · 검색 · 옵션 관리</h1>
      <p>고객이 검색할 동의어를 쉼표 또는 줄바꿈으로 구분하세요. 예: 스웻 팬츠, 트레이닝 바지</p>
      {(data ?? []).map((product) => (
        <form key={product.id} action={saveProductKeywords} className="space-y-2 rounded border p-4">
          <h2 className="font-semibold">{getProductDisplayName(product.name)}</h2>
          <input type="hidden" name="productId" value={product.id} />
          <label className="block" htmlFor={`department-${product.id}`}>오브온 매장</label>
          <select id={`department-${product.id}`} name="department" defaultValue={product.department} className="rounded border p-2">
            <option value="fashion">의류</option><option value="beauty">뷰티</option><option value="home">홈</option>
          </select>
          <label className="block" htmlFor={`keywords-${product.id}`}>검색 키워드</label>
          <textarea id={`keywords-${product.id}`} name="keywords" rows={2}
            defaultValue={product.search_keywords.join(", ")} maxLength={10000}
            className="w-full rounded border p-2" />
          <label className="block" htmlFor={`options-${product.id}`}>상품 옵션</label>
          <p className="text-xs text-gray-500">한 줄에 하나씩 입력하세요. 예: 사이즈: S, M, L / 다음 줄에 색상: 블랙, 화이트. 비워 두면 옵션 없이 판매합니다.</p>
          <textarea id={`options-${product.id}`} name="options" rows={3} maxLength={5000}
            defaultValue={parseProductOptions(product.options).map((option) => `${option.name}${option.required === false ? "?" : ""}: ${option.values.join(", ")}`).join("\n")}
            placeholder={"사이즈: S, M, L\n색상: 블랙, 화이트"} className="w-full rounded border p-2" />
          <button type="submit" className="rounded bg-black px-4 py-2 text-white">저장</button>
        </form>
      ))}
    </main>
  );
}
