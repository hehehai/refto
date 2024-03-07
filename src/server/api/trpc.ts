import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { type TrpcMeta } from "@/types/trpc";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getSession();

  return {
    db,
    session,
    ...opts,
  };
};

const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<TrpcMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, meta, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (meta?.requiredRoles?.length) {
    if (!meta.requiredRoles.includes(ctx.session.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
