import type { NextConfig } from "next";

const config: NextConfig = {
  // Disable Turbopack for build due to @egoist/tailwindcss-icons incompatibility
  // with dynamic require statements
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.refto.one",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "**",
      },
    ],
  },
};

export default config;
