interface Env {
  // Variables (from wrangler.toml [vars])
  CORS_ORIGIN: string;
  BETTER_AUTH_URL: string;
  EMAIL_USER: string;
  GITHUB_CLIENT_ID: string;
  GOOGLE_CLIENT_ID: string;
  CLOUD_FLARE_R2_ACCOUNT_ID: string;
  CLOUD_FLARE_S3_UPLOAD_BUCKET: string;
  VITE_CLOUD_FLARE_R2_URL: string;

  // Hyperdrive binding
  HYPERDRIVE: Hyperdrive;

  // Secrets (set via wrangler secret put)
  BETTER_AUTH_SECRET: string;
  RESEND_API_KEY: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_SECRET: string;
  CLOUD_FLARE_S3_UPLOAD_KEY: string;
  CLOUD_FLARE_S3_UPLOAD_SECRET: string;
}
