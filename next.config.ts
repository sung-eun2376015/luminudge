import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  // next-pwa가 webpack 설정을 주입하는데 Next 16 기본값인 Turbopack과 충돌해서 경고가 남.
  // 개발 모드에선 PWA가 꺼져 있어 문제 없음. 빈 설정으로 Turbopack 사용 의도를 명시해서 경고를 끔.
  turbopack: {},
};

export default withPWA(nextConfig);