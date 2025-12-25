import alchemy from "alchemy";
import { TanStackStart } from "alchemy/cloudflare";
import dotenv from "dotenv";

// 加载 .env 文件
dotenv.config({ path: "./.env" });

const app = await alchemy("refto-one");

export const website = await TanStackStart("website", {
  // 自定义域名
  domains: ["refto.one"],

  // 环境变量 (非敏感)
  env: {
    CORS_ORIGIN: process.env.CORS_ORIGIN!,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
    EMAIL_USER: process.env.EMAIL_USER!,
    CLOUD_FLARE_S3_UPLOAD_BUCKET: process.env.CLOUD_FLARE_S3_UPLOAD_BUCKET!,
    VITE_CLOUD_FLARE_R2_URL: process.env.VITE_CLOUD_FLARE_R2_URL!,
  },

  // Secrets (敏感信息)
  bindings: {
    DATABASE_URL: alchemy.secret(process.env.DATABASE_URL),
    BETTER_AUTH_SECRET: alchemy.secret(process.env.BETTER_AUTH_SECRET),
    RESEND_API_KEY: alchemy.secret(process.env.RESEND_API_KEY),
    GITHUB_CLIENT_ID: alchemy.secret(process.env.GITHUB_CLIENT_ID),
    GITHUB_CLIENT_SECRET: alchemy.secret(process.env.GITHUB_CLIENT_SECRET),
    GOOGLE_CLIENT_ID: alchemy.secret(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: alchemy.secret(process.env.GOOGLE_CLIENT_SECRET),
    CLOUD_FLARE_R2_ACCOUNT_ID: alchemy.secret(
      process.env.CLOUD_FLARE_R2_ACCOUNT_ID
    ),
    CLOUD_FLARE_S3_UPLOAD_KEY: alchemy.secret(
      process.env.CLOUD_FLARE_S3_UPLOAD_KEY
    ),
    CLOUD_FLARE_S3_UPLOAD_SECRET: alchemy.secret(
      process.env.CLOUD_FLARE_S3_UPLOAD_SECRET
    ),
  },
});

console.info(`app url -> ${website.url}`);

await app.finalize();
