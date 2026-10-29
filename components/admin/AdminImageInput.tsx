"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
export function ImageUploadButton({
  onUploaded,
  onBusyChange,
}: {
  onUploaded: (url: string) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-label="이미지 파일 선택"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          onBusyChange?.(true);
          setError("");
          try {
            if (
              !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
              file.size > 5 * 1024 * 1024
            )
              throw new Error("JPG·PNG·WebP 파일을 5MB 이하로 선택해 주세요.");
            const bitmap = await createImageBitmap(file);
            const canvas = document.createElement("canvas");
            const scale = Math.min(
              1,
              1920 / Math.max(bitmap.width, bitmap.height),
            );
            canvas.width = Math.max(1, Math.round(bitmap.width * scale));
            canvas.height = Math.max(1, Math.round(bitmap.height * scale));
            const context = canvas.getContext("2d");
            if (!context) throw new Error("이미지를 처리할 수 없습니다.");
            context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            bitmap.close();
            const blob = await new Promise<Blob>((resolve, reject) =>
              canvas.toBlob(
                (value) =>
                  value
                    ? resolve(value)
                    : reject(new Error("이미지 변환 실패")),
                "image/webp",
                0.85,
              ),
            );
            const client = createClient();
            const path = `uploads/${crypto.randomUUID()}.webp`;
            const { error } = await client.storage
              .from("store-assets")
              .upload(path, blob, {
                contentType: "image/webp",
                cacheControl: "31536000",
                upsert: false,
              });
            if (error) throw new Error(error.message);
            onUploaded(
              client.storage.from("store-assets").getPublicUrl(path).data
                .publicUrl,
            );
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : "이미지를 업로드하지 못했습니다.",
            );
          } finally {
            setBusy(false);
            onBusyChange?.(false);
            e.target.value = "";
          }
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="border border-gray-300 bg-white px-3 py-2 text-xs disabled:opacity-50"
      >
        {busy ? "업로드 중…" : "이미지 업로드"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
export function AdminImageInput({
  name,
  value,
  onChange,
  onBusyChange,
  label = "이미지 주소",
}: {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBusyChange?: (busy: boolean) => void;
  label?: string;
}) {
  const preview =
    /^https:\/\//.test(value) || /^\/(brand|campaigns)\//.test(value);
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          aria-label={label}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… 또는 이미지 업로드"
          maxLength={2048}
          className="min-w-0 flex-1 border border-gray-200 bg-white px-3 py-2 text-sm"
        />
        <ImageUploadButton onUploaded={onChange} onBusyChange={onBusyChange} />
      </div>
      {preview ? (
        <div className="relative h-28 w-40 border border-gray-100 bg-gray-50">
          <Image
            src={value}
            alt="등록 이미지 미리보기"
            fill
            unoptimized
            className="object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
