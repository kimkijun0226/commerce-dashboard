"use client";
import { useActionState, useState } from "react";
import { saveStoreSettings } from "@/app/admin/settings/actions";
import { AdminImageInput } from "./AdminImageInput";
import type { CampaignBanner } from "@/lib/catalog/campaigns";
import type { StoreKey } from "@/lib/catalog/storefront";
import type { CatalogCategory } from "@/lib/catalog/products";
const field = "w-full border border-gray-200 bg-white px-3 py-2 text-sm";
export function StoreSettingsEditor({
  department,
  logoUrl,
  banners: initial,
  categories,
}: {
  department: StoreKey;
  logoUrl: string;
  banners: CampaignBanner[];
  categories: CatalogCategory[];
}) {
  const [logo, setLogo] = useState(logoUrl);
  const [banners, setBanners] = useState(initial);
  const [state, action, pending] = useActionState(saveStoreSettings, {});
  const [uploads, setUploads] = useState(0);
  const uploadBusy = (busy: boolean) =>
    setUploads((count) => Math.max(0, count + (busy ? 1 : -1)));
  const update = (index: number, patch: Partial<CampaignBanner>) =>
    setBanners((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  const move = (index: number, step: number) =>
    setBanners((rows) => {
      const copy = [...rows];
      [copy[index], copy[index + step]] = [copy[index + step], copy[index]];
      return copy;
    });
  return (
    <form
      key={state.savedAt ?? "initial"}
      action={action}
      className="space-y-6"
    >
      <input type="hidden" name="department" value={department} />
      <input type="hidden" name="banners" value={JSON.stringify(banners)} />
      <section className="space-y-4 border border-gray-200 bg-white p-5">
        <h2 className="font-semibold">매장 로고</h2>
        <AdminImageInput
          name="logoUrl"
          value={logo}
          onChange={setLogo}
          onBusyChange={uploadBusy}
          label="매장 로고 주소"
        />
        <button
          type="button"
          onClick={() => setLogo("/brand/revie-logo.svg")}
          className="text-xs text-gray-500 underline"
        >
          레비 기본 로고 사용
        </button>
        <p className="text-xs text-gray-500">
          이 매장 헤더에 반영됩니다. 투명 배경 PNG·WebP를 권장합니다.
        </p>
      </section>
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold">메인 배너</h2>
          <p className="mt-2 text-xs leading-5 text-gray-500">
            표시 순서, 노출 여부, 이미지와 문구를 수정하세요. 카테고리와 검색
            태그를 모두 지정하면 두 조건으로 필터링합니다. 둘 다 비우면 전체
            상품으로 이동합니다.
          </p>
        </div>
        {banners.map((banner, index) => (
          <details key={index} className="border border-gray-200 bg-white">
            <summary className="cursor-pointer p-4 text-sm">
              <span className="mr-3 text-gray-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{banner.title}</strong>
              <span className="ml-3 text-xs text-gray-400">
                {banner.enabled ? "노출중" : "숨김"}
              </span>
            </summary>
            <div className="space-y-4 border-t border-gray-100 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={banner.enabled}
                    onChange={(e) =>
                      update(index, { enabled: e.target.checked })
                    }
                  />
                  배너 노출
                </label>
                <button
                  type="button"
                  disabled={uploads > 0 || index === 0}
                  onClick={() => move(index, -1)}
                  className="border px-3 py-1 text-xs disabled:opacity-30"
                >
                  위로
                </button>
                <button
                  type="button"
                  disabled={uploads > 0 || index === banners.length - 1}
                  onClick={() => move(index, 1)}
                  className="border px-3 py-1 text-xs disabled:opacity-30"
                >
                  아래로
                </button>
              </div>
              <label className="block space-y-2 text-sm">
                <span>제목</span>
                <input
                  value={banner.title}
                  maxLength={60}
                  required
                  onChange={(e) => update(index, { title: e.target.value })}
                  className={field}
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span>보조 문구</span>
                <input
                  value={banner.description}
                  maxLength={140}
                  onChange={(e) =>
                    update(index, { description: e.target.value })
                  }
                  className={field}
                />
              </label>
              <AdminImageInput
                value={banner.imageUrl}
                onBusyChange={uploadBusy}
                onChange={(value) => update(index, { imageUrl: value })}
                label={`${index + 1}번 배너 이미지 주소`}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span>이동할 카테고리</span>
                  <select
                    value={banner.category ?? ""}
                    onChange={(e) =>
                      update(index, { category: e.target.value })
                    }
                    className={field}
                  >
                    <option value="">전체 카테고리</option>
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span>검색 태그 / 검색어</span>
                  <input
                    value={banner.q ?? ""}
                    maxLength={200}
                    onChange={(e) => update(index, { q: e.target.value })}
                    placeholder="#롱 #스커트 또는 롱 스커트"
                    className={field}
                  />
                </label>
              </div>
            </div>
          </details>
        ))}
      </section>
      {state.error ? (
        <p role="alert" className="bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.saved ? (
        <p role="status" className="bg-green-50 p-4 text-sm text-green-800">
          로고와 배너가 저장되어 쇼핑몰에 반영되었습니다.
        </p>
      ) : null}
      <button
        disabled={pending || uploads > 0}
        className="bg-black px-6 py-3 text-sm text-white disabled:opacity-50"
      >
        {pending ? "저장 중…" : "매장 설정 저장"}
      </button>
    </form>
  );
}
