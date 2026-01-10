import { type CloudflareEnv, createAuth } from "@refto-one/auth";
import { z } from "zod";
import { publicProcedure } from "../index";

// Helper to get Cloudflare env bindings
// Returns undefined in non-Cloudflare environments
async function loadCloudflareEnv(): Promise<CloudflareEnv | undefined> {
  try {
    const cloudflareWorkers = await import("cloudflare:workers");
    return cloudflareWorkers.env as CloudflareEnv;
  } catch {
    return;
  }
}

// Cache the env getter promise
const envPromise = loadCloudflareEnv();

export const authRouter = {
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .handler(async ({ input }) => {
      const env = await envPromise;
      const auth = createAuth(env);
      return auth.api.verifyEmail({ query: { token: input.token } });
    }),
};
