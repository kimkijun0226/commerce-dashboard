"use client";
import { useState } from "react";
import { parseSearchKeywords } from "@/lib/catalog/keywords";
export function SearchTagInput({
  initialTags = [],
}: {
  initialTags?: string[];
}) {
  const [tags, setTags] = useState(initialTags);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const add = () => {
    try {
      const next = parseSearchKeywords([...tags, draft].join(","));
      setTags(next);
      setDraft("");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "태그를 확인해 주세요.");
    }
  };
  return (
    <div>
      <input type="hidden" name="keywords" value={[...tags, draft].join(",")} />
      <div className="flex min-h-12 flex-wrap gap-2 border border-gray-200 bg-white p-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-xs"
          >
            #{tag}
            <button
              type="button"
              aria-label={`${tag} 태그 삭제`}
              onClick={() => setTags(tags.filter((v) => v !== tag))}
              className="px-1"
            >
              ×
            </button>
          </span>
        ))}
        <input
          aria-label="검색 태그 추가"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={add}
          onKeyDown={(e) => {
            if (!e.nativeEvent.isComposing && ["Enter", ","].includes(e.key)) {
              e.preventDefault();
              add();
            }
          }}
          placeholder="태그 입력 후 Enter"
          className="min-w-32 flex-1 px-1 text-sm outline-none"
          maxLength={500}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        #롱 스커트 #맥시처럼 추가하세요. 띄어쓰기가 있는 검색어도 한 태그로
        저장됩니다.
      </p>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
