import { LRUCache } from "lru-cache";
import { type NextRequest } from "next/server";

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (res: NextRequest, limit: number, token: string) =>
      new Promise<boolean>((resolve) => {
        const tokenCount = tokenCache.get(token) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0] ?? 0;
        const isRateLimited = currentUsage >= limit;
        res.headers.set("X-RateLimit-Limit", String(limit.toString()));
        res.headers.set(
          "X-RateLimit-Remaining",
          String(isRateLimited ? 0 : limit - currentUsage),
        );

        return isRateLimited ? resolve(false) : resolve(true);
      }),
  };
}

export const trpcApiLimit = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});
