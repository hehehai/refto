import { type CloudflareEnv, createAuth } from "@refto-one/auth";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

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

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  const env = await envPromise;
  const auth = createAuth(env);
  const request = getRequest();
  const session = await auth.api.getSession({
    headers: request.headers,
    returnHeaders: true,
  });

  // Forward any Set-Cookie headers to the client, e.g. for session/cache refresh
  const cookies = session?.headers?.getSetCookie();
  if (cookies?.length) {
    setResponseHeader("Set-Cookie", cookies);
  }

  return session.response?.user || null;
});
