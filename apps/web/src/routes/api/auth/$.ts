import { type CloudflareEnv, createAuth } from "@refto-one/auth";
import { createFileRoute } from "@tanstack/react-router";

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

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const env = await envPromise;
        const auth = createAuth(env);
        return auth.handler(request);
      },
      POST: async ({ request }) => {
        const env = await envPromise;
        const auth = createAuth(env);
        return auth.handler(request);
      },
    },
  },
});
