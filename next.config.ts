import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // API-Football serves team logos & flags from these hosts.
    remotePatterns: [
      { protocol: "https", hostname: "media.api-sports.io" },
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
  // three.js ships large source maps we don't need to trace.
  productionBrowserSourceMaps: false,
};

export default nextConfig;
