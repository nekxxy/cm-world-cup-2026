import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Telegram serves avatars from t.me; allow remote images.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "t.me" },
      { protocol: "https", hostname: "**.telegram.org" },
    ],
  },
};

export default nextConfig;
