import { createRouterClient } from "@orpc/server";
import { cache } from "react";
import { createORPCContext } from "@/server/api/orpc";
import { appRouter } from "@/server/api/root";

/**
 * Server-side oRPC client for RSC (React Server Components)
 * This calls procedures directly without HTTP requests
 */
const createServerClient = cache(async () => {
  const context = await createORPCContext();
  return createRouterClient(appRouter, { context });
});

/**
 * Get the server-side oRPC client
 * Use this in Server Components to call procedures directly
 */
export async function getServerClient() {
  return createServerClient();
}

/**
 * Convenience export for direct server-side calls
 * Usage: const client = await api(); client.refSites.query(...)
 */
export const api = getServerClient;
