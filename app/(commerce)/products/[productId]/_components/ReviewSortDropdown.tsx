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
    <div ref={rootRef} className={cn("relative min-w-[200px] sm:min-w-[256px]", className)}>
      <button
        id={btnId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-12 w-full min-w-[200px] items-center justify-between gap-2 rounded-lg border border-[#e8ecef] bg-white px-4 shadow-sm",
          "text-left text-base font-semibold leading-[26px] text-[#141718]",
          "transition-[box-shadow,border-color] duration-200 hover:shadow-md",
          "focus-visible:border-[#141718] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--commerce-semantic-info) focus-visible:ring-offset-2",
          open && "border-[#cbcbcb] shadow-md",
        )}
        style={{ fontFamily: "var(--commerce-font-body)" }}
      >
        <span className="truncate">{labelForSortOption(value)}</span>
        <FiChevronDown
          className={cn(
            "size-6 shrink-0 text-[#141718] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <div
        id={listId}
        role="listbox"
        aria-labelledby={btnId}
        aria-hidden={!open}
        className={cn(
          "absolute left-0 z-50 mt-1 w-full rounded-lg border border-[#e8ecef] bg-white shadow-lg",
          "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "grid-rows-[1fr]" : "pointer-events-none grid-rows-[0fr]",
        )}
      >
        <div
          className={cn(
            "min-h-0 overflow-hidden transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            open
              ? "translate-y-0 opacity-100"
              : "-translate-y-2 opacity-0",
          )}
        >
          <ul className="max-h-64 overflow-auto py-1">
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
                      "flex w-full items-center px-4 py-3 text-left text-base leading-[26px] transition-colors duration-150",
                      "hover:bg-[#f3f5f7]",
                      selected
                        ? "bg-[#f3f5f7] font-semibold text-[#141718]"
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
  );
}
