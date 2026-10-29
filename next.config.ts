import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // 상위 디렉토리의 lockfile이 있어도 프로젝트 루트를 고정
    root: path.resolve(__dirname),
  },
  images: {
    minimumCacheTTL: 86400,
    deviceSizes: [360, 480, 640, 768, 960, 1200, 1600, 1920],
    imageSizes: [32, 48, 64, 96, 128, 192, 256, 320],
    qualities: [60, 75],
    remotePatterns: [
      { protocol: "https", hostname: "www.charmer.kr", pathname: "/web/product/**" },
      { protocol: "https", hostname: "www.cosrx.com", pathname: "/cdn/shop/**" },
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/s/files/**" },
      { protocol: "https", hostname: "fermliving.com", pathname: "/cdn/shop/**" },
      {
        protocol: "https",
        hostname: "shopping-phinf.pstatic.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
