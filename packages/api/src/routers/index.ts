import type { RouterClient } from "@orpc/server";
import { protectedProcedure, publicProcedure } from "../index";
import { authRouter } from "./auth";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
  privateData: protectedProcedure.handler(({ context }) => ({
    message: "This is private",
    user: context.session?.user,
  })),
  auth: authRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
