import { auth } from "@refto-one/auth";
import { createDb } from "@refto-one/db";
import type { KVNamespace } from "./lib/cache";

export async function createContext({ req }: { req: Request }) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  // 从 globalThis 获取 KV (Cloudflare Workers 注入)
  const kv = (globalThis as Record<string, unknown>).CACHE as
    | KVNamespace
    | undefined;

  return {
    session,
    db: createDb(),
    kv,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
