import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * SSR Dependencies to pre-bundle
 *
 * These dependencies are listed to avoid runtime discovery which causes
 * "program reload" cycles in workerd. Each reload accumulates memory until
 * the ~1.5GB limit is reached and workerd crashes.
 *
 * Add new dependencies here if you see:
 * "[vite] (ssr) ✨ new dependencies optimized: <package-name>"
 */
const ssrOptimizeDepsInclude = [
  // React core
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",

  // TanStack ecosystem
  "@tanstack/react-query",
  "@tanstack/react-router",
  "@tanstack/zod-adapter",
  "@tanstack/react-form",
  "@tanstack/react-table",

  // UI utilities
  "clsx",
  "tailwind-merge",
  "class-variance-authority",
  "sonner",

  // Data & validation
  "zod",
  "date-fns",
  "slug",
  "es-toolkit",

  // Form & input components
  "input-otp",
  "cmdk",
  "react-day-picker",
  "use-file-picker",
  "react-hotkeys-hook",

  // Charts
  "recharts",

  // Animation
  "motion",
  "motion/react",

  // Base UI components
  "@base-ui/react/alert-dialog",
  "@base-ui/react/avatar",
  "@base-ui/react/button",
  "@base-ui/react/checkbox",
  "@base-ui/react/collapsible",
  "@base-ui/react/dialog",
  "@base-ui/react/field",
  "@base-ui/react/fieldset",
  "@base-ui/react/form",
  "@base-ui/react/input",
  "@base-ui/react/menu",
  "@base-ui/react/merge-props",
  "@base-ui/react/number-field",
  "@base-ui/react/popover",
  "@base-ui/react/preview-card",
  "@base-ui/react/progress",
  "@base-ui/react/radio-group",
  "@base-ui/react/scroll-area",
  "@base-ui/react/select",
  "@base-ui/react/separator",
  "@base-ui/react/slider",
  "@base-ui/react/switch",
  "@base-ui/react/tabs",
  "@base-ui/react/toggle",
  "@base-ui/react/toggle-group",
  "@base-ui/react/tooltip",
  "@base-ui/react/use-render",

  // Icons
  "@hugeicons/core-free-icons",
  "@hugeicons/react",

  // oRPC
  "@orpc/server",
  "@orpc/server/fetch",
  "@orpc/tanstack-query",
  "@orpc/openapi/fetch",
  "@orpc/openapi/plugins",
  "@orpc/zod/zod4",

  // Better Auth
  "better-auth",
  "better-auth/adapters/drizzle",
  "better-auth/client/plugins",
  "better-auth/plugins",
  "better-auth/plugins/email-otp",
  "better-auth/plugins/magic-link",
  "better-auth/react",
  "better-auth/tanstack-start",

  // Database (from workspace packages)
  "drizzle-orm",
  "drizzle-orm/pg-core",
  "drizzle-orm/postgres-js",
  "postgres",

  // AWS SDK (from workspace packages, lazy-loaded at runtime)
  "@aws-sdk/client-s3",
  "@aws-sdk/s3-request-presigner",

  // Email validation (from workspace packages, lazy-loaded at runtime)
  "@devmehq/email-validator-js",
];

export default defineConfig({
  server: {
    warmup: {
      clientFiles: [],
    },
  },
  optimizeDeps: {
    holdUntilCrawlEnd: false,
  },
  ssr: {
    // Bundle workspace packages so their dependencies can be discovered
    noExternal: [
      "@refto-one/api",
      "@refto-one/auth",
      "@refto-one/common",
      "@refto-one/db",
      "@refto-one/email",
    ],
    optimizeDeps: {
      // Wait until all dependencies are discovered before starting optimization
      // This prevents multiple program reload cycles that cause memory buildup
      holdUntilCrawlEnd: true,
      include: ssrOptimizeDepsInclude,
    },
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart({
      sitemap: {
        host: "https://refto.one",
      },
    }),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});
