"use client";

import {
  REVIEW_SORT_OPTIONS,
  type ReviewSortOption,
  labelForSortOption,
} from "@/app/(commerce)/products/[productId]/_components/reviewSort";
import { cn } from "@/components/ui";
import { useEffect, useId, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export type ReviewSortDropdownProps = {
  value: ReviewSortOption;
  onChange: (value: ReviewSortOption) => void;
  className?: string;
};

export function ReviewSortDropdown({
  value,
  onChange,
  className,
}: ReviewSortDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const btnId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={cn("relative min-w-[200px] sm:min-w-[256px]", className)}
    >
      <button
        id={btnId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-12 w-full min-w-[200px] items-center justify-between gap-2 rounded-lg border bg-white px-4",
          "border-[#e5e8eb] text-left text-base font-semibold leading-[26px] text-[#141718]",
          "transition-[border-color,background-color,box-shadow] duration-200",
          "hover:border-[#cdd1d5] hover:bg-[#fafbfb]",
          "focus-visible:border-[#141718] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-semantic-info) focus-visible:ring-offset-2",
          "active:bg-[#f4f5f6]",
          open
            ? "border-[#b8bdc2] bg-white ring-1 ring-[#141718]/8"
            : "shadow-none ring-0",
        )}
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        <span className="truncate">{labelForSortOption(value)}</span>
        <FiChevronDown
          className={cn(
            "size-5 shrink-0 text-[#353945] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
            open && "rotate-180 text-[#141718]",
          )}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          "absolute left-0 z-50 w-full overflow-hidden",
          "top-full",
          open ? "pt-2" : "pt-0",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
            open ? "grid-rows-[1fr]" : "pointer-events-none grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              id={listId}
              role="listbox"
              aria-labelledby={btnId}
              className={cn(
                "origin-top overflow-hidden rounded-lg border border-[#e8ecef] bg-white",
                "shadow-[0_12px_40px_-12px_rgba(20,23,24,0.22)]",
                "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                open
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-2 opacity-0",
              )}
            >
              <ul className="max-h-64 overflow-auto py-1.5" role="none">
                {REVIEW_SORT_OPTIONS.map((opt) => {
                  const selected = opt.value === value;
                  return (
                    <li key={opt.value} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          onChange(opt.value);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center px-4 py-2.5 text-left text-[15px] leading-[24px] transition-colors duration-150",
                          "first:pt-3 last:pb-3",
                          "hover:bg-[#f3f5f7] focus-visible:bg-[#f3f5f7] focus-visible:outline-none",
                          selected
                            ? "bg-[#eef1f4] font-semibold text-[#141718]"
                            : "font-medium text-[#353945]",
                        )}
                        style={{ fontFamily: "var(--commerce-font-body)" }}
                      >
                        {opt.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
