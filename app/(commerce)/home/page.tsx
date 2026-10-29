import { StorefrontPage, type StorefrontSearchParams } from "@/components/commerce/home/StorefrontPage";
export const metadata = { title: "레비 · 홈" };
export default function Page({ searchParams }: { searchParams: StorefrontSearchParams }) { return <StorefrontPage department="home" searchParams={searchParams} />; }
