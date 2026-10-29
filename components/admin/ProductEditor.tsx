"use client";
import { useActionState, useState } from "react";
import { saveProduct } from "@/app/admin/products/actions";
import type { Database } from "@/types/supabase";
import { parseProductOptions } from "@/commons/utils/productOptions";
import { SearchTagInput } from "./SearchTagInput";
import { AdminImageInput, ImageUploadButton } from "./AdminImageInput";
const field =
  "mt-2 w-full border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500";
export function ProductEditor({
  product,
}: {
  product?: Database["public"]["Tables"]["products"]["Row"];
}) {
  const [state, action, pending] = useActionState(saveProduct, {});
  const [uploads, setUploads] = useState(0);
  const uploadBusy = (busy: boolean) =>
    setUploads((count) => Math.max(0, count + (busy ? 1 : -1)));
  const [image, setImage] = useState(product?.image_url ?? "");
  const [details, setDetails] = useState(
    product?.detail_image_urls.join("\n") ?? "",
  );
  const info = product?.additional_info;
  const brand =
    info &&
    typeof info === "object" &&
    !Array.isArray(info) &&
    typeof info["브랜드"] === "string"
      ? info["브랜드"]
      : "";
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="productId" value={product?.id ?? ""} />
      <section className="space-y-5 border border-gray-200 bg-white p-5">
        <h2 className="font-semibold">기본 정보</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            상품명
            <input
              name="name"
              required
              maxLength={200}
              defaultValue={product?.name}
              className={field}
            />
          </label>
          <label className="text-sm">
            브랜드
            <input
              name="brand"
              maxLength={100}
              defaultValue={brand}
              className={field}
            />
          </label>
          <label className="text-sm">
            매장
            <select
              name="department"
              defaultValue={product?.department ?? "fashion"}
              className={field}
            >
              <option value="fashion">의류</option>
              <option value="beauty">뷰티</option>
              <option value="home">홈</option>
            </select>
          </label>
          <label className="text-sm">
            판매 상태
            <select
              name="status"
              defaultValue={product?.status ?? "hidden"}
              className={field}
            >
              <option value="registered">판매중</option>
              <option value="hidden">숨김</option>
              <option value="sold_out">품절</option>
            </select>
          </label>
          <label className="text-sm">
            판매가 (원)
            <input
              name="price"
              type="number"
              required
              min={1}
              max={1000000000}
              step={1}
              defaultValue={product?.price}
              className={field}
            />
          </label>
          <label className="text-sm">
            할인가 (선택)
            <input
              name="salePrice"
              type="number"
              min={1}
              step={1}
              defaultValue={product?.sale_price ?? ""}
              className={field}
            />
          </label>
        </div>
        <label className="block text-sm">
          카테고리
          <input
            name="categories"
            required
            maxLength={500}
            defaultValue={product?.categories?.join(", ")}
            placeholder="스커트, 여성"
            className={field}
          />
          <span className="mt-1 block text-xs text-gray-500">
            쉼표로 구분합니다. 매장 카테고리 목록에 자동 반영됩니다.
          </span>
        </label>
        <div>
          <h3 className="mb-2 text-sm">검색 태그</h3>
          <SearchTagInput initialTags={product?.search_keywords} />
        </div>
        <label className="block text-sm">
          상품 설명
          <textarea
            name="description"
            rows={5}
            maxLength={10000}
            defaultValue={product?.description ?? ""}
            className={field}
          />
        </label>
      </section>
      <section className="space-y-5 border border-gray-200 bg-white p-5">
        <h2 className="font-semibold">이미지 · 옵션</h2>
        <div>
          <p className="mb-2 text-sm">대표 이미지</p>
          <AdminImageInput
            name="imageUrl"
            value={image}
            onChange={setImage}
            onBusyChange={uploadBusy}
          />
        </div>
        <label className="block text-sm">
          상세 이미지
          <textarea
            name="detailImages"
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className={field}
            placeholder="한 줄에 HTTPS 이미지 주소 하나씩 (최대 12장)"
          />
        </label>
        <ImageUploadButton
          onBusyChange={uploadBusy}
          onUploaded={(url) =>
            setDetails((current) => [current, url].filter(Boolean).join("\n"))
          }
        />
        <label className="block text-sm">
          상품 옵션
          <textarea
            name="options"
            rows={4}
            maxLength={5000}
            defaultValue={parseProductOptions(product?.options)
              .map(
                (option) =>
                  `${option.name}${option.required === false ? "?" : ""}: ${option.values.join(", ")}`,
              )
              .join("\n")}
            placeholder={"사이즈: S, M, L\n색상: 블랙, 화이트"}
            className={field}
          />
          <span className="mt-1 block text-xs text-gray-500">
            한 줄에 옵션 하나. 선택 사항은 옵션명 뒤에 ?를 붙입니다. 비우면 옵션
            없이 판매합니다.
          </span>
        </label>
      </section>
      {state.error ? (
        <p
          role="alert"
          className="border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {state.error}
        </p>
      ) : null}
      <button
        disabled={pending || uploads > 0}
        className="bg-black px-7 py-3 text-sm text-white disabled:opacity-50"
      >
        {pending ? "저장 중…" : "상품 저장"}
      </button>
    </form>
  );
}
