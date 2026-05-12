"use client";

import Image from "next/image";
import Link from "next/link";
import { getProductDetailUrl } from "@/commons/constants/url";

export type LikeListItem = {
  likeId: string;
  likedAt: string;
  product: {
    id: string;
    name: string;
    status: "registered" | "hidden" | "sold_out";
    imageUrl: string | null;
    price: number;
    salePrice: number | null;
  };
};

function formatPriceKrw(n: number) {
  const rounded = Math.round(n);
  return `${rounded.toLocaleString("ko-KR")}원`;
}

function statusLabel(status: LikeListItem["product"]["status"]) {
  if (status === "registered") return "Active";
  if (status === "sold_out") return "Sold Out";
  return "Hidden";
}

export function LikeListTable({ items }: { items: LikeListItem[] }) {
  return (
    <div className="w-full overflow-hidden rounded-lg bg-white">
      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[160px_1fr_120px_137px] border-b border-(--commerce-border-subtle) py-1 text-[14px] leading-[22px] text-(--commerce-text-secondary)">
          <div>Image</div>
          <div>Name</div>
          <div>Status</div>
          <div>Price</div>
        </div>

        {items.map((it) => {
          const price = it.product.salePrice ?? it.product.price;
          return (
            <div
              key={it.likeId}
              className="grid grid-cols-[160px_1fr_120px_137px] border-b border-(--commerce-border-subtle) py-6"
            >
              <div className="flex items-center">
                <div className="relative h-[96px] w-[80px] overflow-hidden bg-(--commerce-background-light)">
                  {it.product.imageUrl ? (
                    <Image
                      src={it.product.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized={
                        it.product.imageUrl.startsWith("http://") ||
                        it.product.imageUrl.startsWith("https://")
                      }
                      sizes="80px"
                    />
                  ) : null}
                </div>
              </div>

              <div className="flex items-center">
                <Link
                  href={getProductDetailUrl(it.product.id)}
                  className="text-[14px] leading-[22px] text-(--commerce-text-primary) hover:underline"
                >
                  {it.product.name}
                </Link>
              </div>

              <div className="flex items-center text-[14px] leading-[22px] text-(--commerce-text-primary)">
                {statusLabel(it.product.status)}
              </div>

              <div className="flex items-center justify-start text-[14px] leading-[22px] text-(--commerce-text-primary)">
                {formatPriceKrw(price)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile list */}
      <div className="md:hidden">
        {items.map((it) => {
          const price = it.product.salePrice ?? it.product.price;
          return (
            <div
              key={it.likeId}
              className="flex gap-4 border-b border-(--commerce-border-subtle) p-4"
            >
              <div className="relative h-[96px] w-[80px] shrink-0 overflow-hidden bg-(--commerce-background-light)">
                {it.product.imageUrl ? (
                  <Image
                    src={it.product.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={
                      it.product.imageUrl.startsWith("http://") ||
                      it.product.imageUrl.startsWith("https://")
                    }
                    sizes="80px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={getProductDetailUrl(it.product.id)}
                  className="block truncate text-[14px] leading-[22px] text-(--commerce-text-primary) hover:underline"
                >
                  {it.product.name}
                </Link>
                <div className="mt-1 text-[14px] leading-[22px] text-(--commerce-text-secondary)">
                  {statusLabel(it.product.status)}
                </div>
                <div className="mt-2 text-[14px] leading-[22px] text-(--commerce-text-primary)">
                  {formatPriceKrw(price)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

