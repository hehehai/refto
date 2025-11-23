import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

import { env } from "@/env";
import { trpcApiLimit } from "@/lib/rate-limit";
import { getRealIp } from "@/lib/utils";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

// Disable Next.js fetch cache to avoid AbortError conflicts with tRPC
export const fetchCache = "force-no-store";

const createContext = async (req: NextRequest) =>
  createTRPCContext({
    headers: req.headers,
  });

const handler = async (req: NextRequest) => {
  const clientIp = getRealIp(req);
  const passed = await trpcApiLimit.check(req, 100, clientIp);
  if (!passed) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
    responseMeta({ type, errors, paths }) {
      const allOk = errors.length === 0;
      const isQuery = type === "query";
      const allPublic = paths?.every((path) => path.includes("refSites"));
      if (allPublic && allOk && isQuery) {
        // cache request for 1 day + revalidate once every second
        const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
        return {
          headers: {
            "cache-control": `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
          },
        };
      }
      return {};
    },
  });
};

export { handler as GET, handler as POST };
