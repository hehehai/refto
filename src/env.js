import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      (str) => process.env.VERCEL_URL ?? str,
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string().optional(),
    RESEND_API_KEY: z.string(),
    LOCAL_PROXY_URL: z.string().optional(),
    CLOUD_FLARE_R2_ACCOUNT_ID: z.string(),
    CLOUD_FLARE_S3_UPLOAD_KEY: z.string(),
    CLOUD_FLARE_S3_UPLOAD_SECRET: z.string(),
    CLOUD_FLARE_S3_UPLOAD_BUCKET: z.string(),
    ARCJET_KEY: z.string(),
  },

  client: {
    NEXT_PUBLIC_CLOUD_FLARE_R2_URL: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    LOCAL_PROXY_URL: process.env.LOCAL_PROXY_URL,
    CLOUD_FLARE_R2_ACCOUNT_ID: process.env.CLOUD_FLARE_R2_ACCOUNT_ID,
    CLOUD_FLARE_S3_UPLOAD_KEY: process.env.CLOUD_FLARE_S3_UPLOAD_KEY,
    CLOUD_FLARE_S3_UPLOAD_SECRET: process.env.CLOUD_FLARE_S3_UPLOAD_SECRET,
    CLOUD_FLARE_S3_UPLOAD_BUCKET: process.env.CLOUD_FLARE_S3_UPLOAD_BUCKET,
    NEXT_PUBLIC_CLOUD_FLARE_R2_URL: process.env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL,
    ARCJET_KEY: process.env.ARCJET_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
