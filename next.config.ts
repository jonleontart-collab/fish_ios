import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/ios_fishing",
  turbopack: {
    root: path.join(__dirname),
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "/ios_fishing",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
