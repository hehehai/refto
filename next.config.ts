import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

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

export default withNextIntl(config);
