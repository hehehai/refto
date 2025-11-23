import { ORPCError, os } from "@orpc/server";
import { headers } from "next/headers";

import { db } from "@/lib/db";
import { getSession, type Session } from "@/lib/session";
import type { Role } from "@/types/rpc";

interface ORPCMeta {
  requiredRoles?: Role[];
}

/**
 * Create context for oRPC - used in both HTTP handler and server-side calls
 */
export async function createORPCContext() {
  const headersList = await headers();
  const heads = new Headers(headersList);
  const session = await getSession();

  return {
    db,
    session,
    headers: heads,
  };
}

type Context = Awaited<ReturnType<typeof createORPCContext>>;

/**
 * Create the base oRPC instance with context and meta
 */
const base = os.$context<Context>().$meta<ORPCMeta>({});

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = base;

/**
 * Protected procedure - requires authentication and optional role check
 */
export const protectedProcedure = base.use(({ context, next, procedure }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  const meta = procedure["~orpc"].meta as ORPCMeta | undefined;
  const userRole = (context.session.user.role as Role) || "USER";
  const requiredRoles = meta?.requiredRoles;

  if (requiredRoles?.length && !requiredRoles.includes(userRole)) {
    throw new ORPCError("FORBIDDEN");
  }

  return next({
    context: {
      session: context.session as Session,
    },
  });
});

/**
 * Admin procedure - shortcut for admin-only operations
 */
export const adminProcedure = protectedProcedure.meta({
  requiredRoles: ["ADMIN"] as Role[],
});

export { createORPCContext as createContext };
