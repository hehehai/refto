import { type CloudflareEnv, createAuth } from "@refto-one/auth";
import { createDb } from "@refto-one/db";
import type { KVNamespace } from "./lib/cache";

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

export async function createContext({ req }: { req: Request }) {
  const env = await envPromise;
  const auth = createAuth(env);

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  // Get connection string from env or use default
  const connectionString = env?.HYPERDRIVE?.connectionString;

  // Get KV from env or fallback to globalThis (for backward compatibility)
  const kv = (env?.CACHE ?? (globalThis as Record<string, unknown>).CACHE) as
    | KVNamespace
    | undefined;

  return {
    session,
    db: createDb(connectionString),
    kv,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
