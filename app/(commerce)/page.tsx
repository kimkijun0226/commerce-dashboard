import { StorefrontPage, type StorefrontSearchParams } from "@/components/commerce/home/StorefrontPage";
export default function Page({ searchParams }: { searchParams: StorefrontSearchParams }) { return <StorefrontPage department="home" searchParams={searchParams} />; }
