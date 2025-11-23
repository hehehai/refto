import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";

import type { AppRouter } from "@/server/api/root";

export function getUrl() {
  if (typeof window !== "undefined") {
    // Client-side: use relative URL with origin
    return `${window.location.origin}/api/rpc`;
  }
  // Server-side
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/rpc`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}/api/rpc`;
}

const link = new RPCLink({
  url: () => getUrl(),
  headers: async () => {
    if (typeof window !== "undefined") {
      return {};
    }
    // Server-side: forward headers
    const { headers } = await import("next/headers");
    const headersList = await headers();
    const forwardHeaders: Record<string, string> = {};
    headersList.forEach((value, key) => {
      forwardHeaders[key] = value;
    });
    return forwardHeaders;
  },
});

export const client: RouterClient<AppRouter> = createORPCClient(link);
