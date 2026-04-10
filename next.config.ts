import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // 상위 디렉토리의 lockfile이 있어도 프로젝트 루트를 고정
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
