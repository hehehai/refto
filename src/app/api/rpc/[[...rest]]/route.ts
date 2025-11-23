import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import type { NextRequest } from "next/server";

import { env } from "@/env";
import { rpcApiLimit } from "@/lib/rate-limit";
import { getRealIp } from "@/lib/utils";
import { createORPCContext } from "@/server/api/orpc";
import { appRouter } from "@/server/api/root";

// Disable Next.js fetch cache
export const fetchCache = "force-no-store";

const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error: unknown) => {
      if (env.NODE_ENV === "development") {
        console.error(
          "❌ oRPC error:",
          error instanceof Error ? error.message : error
        );
      }
    }),
  ],
});

async function handleRequest(request: NextRequest) {
  const clientIp = getRealIp(request);
  const passed = await rpcApiLimit.check(request, 100, clientIp);
  if (!passed) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  const context = await createORPCContext();

  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context,
  });

  if (!response) {
    return new Response("Not found", { status: 404 });
  }

  // Add cache headers for public refSites queries
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/rpc/", "");
  if (path.startsWith("refSites") && request.method === "GET") {
    const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
    response.headers.set(
      "cache-control",
      `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`
    );
  }

  return response;
}

export { handleRequest as GET, handleRequest as POST };
