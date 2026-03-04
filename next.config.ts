import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "content.savehome.kr",
      },
    ],
  },
};

export default nextConfig;
