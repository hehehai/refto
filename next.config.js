/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-f815ef445d13430e8011cfd52bf4e100.r2.dev",
        pathname: "**",
      },
    ],
  },
};

export default config;
