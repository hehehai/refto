import alchemy from "alchemy";
import { TanStackStart, Worker } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const app = await alchemy("refto-one");

export const web = await TanStackStart("web", {
  cwd: "../../apps/web",
  bindings: {
    VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL!,
    VITE_CLOUD_FLARE_R2_URL: alchemy.env.VITE_CLOUD_FLARE_R2_URL!,
  },
});

export const server = await Worker("server", {
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    DATABASE_URL: alchemy.secret.env.DATABASE_URL!,
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
    EMAIL_USER: alchemy.secret.env.EMAIL_USER!,
    RESEND_API_KEY: alchemy.secret.env.RESEND_API_KEY!,
    GITHUB_CLIENT_ID: alchemy.secret.env.GITHUB_CLIENT_ID!,
    GITHUB_CLIENT_SECRET: alchemy.secret.env.GITHUB_CLIENT_SECRET!,
    GOOGLE_CLIENT_ID: alchemy.secret.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: alchemy.secret.env.GOOGLE_CLIENT_SECRET!,
    CLOUD_FLARE_R2_ACCOUNT_ID: alchemy.secret.env.CLOUD_FLARE_R2_ACCOUNT_ID!,
    CLOUD_FLARE_S3_UPLOAD_KEY: alchemy.secret.env.CLOUD_FLARE_S3_UPLOAD_KEY!,
    CLOUD_FLARE_S3_UPLOAD_SECRET:
      alchemy.secret.env.CLOUD_FLARE_S3_UPLOAD_SECRET!,
    CLOUD_FLARE_S3_UPLOAD_BUCKET:
      alchemy.secret.env.CLOUD_FLARE_S3_UPLOAD_BUCKET!,
    CLOUD_FLARE_R2_URL: alchemy.secret.env.CLOUD_FLARE_R2_URL!,
  },
  dev: {
    port: 3000,
  },
});

console.info(`Web    -> ${web.url}`);
console.info(`Server -> ${server.url}`);

await app.finalize();
