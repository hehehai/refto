import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";

import { refSitesRouter } from "@/server/api/routers/ref-sites";
import { siteMetaRouter } from "./routers/site-meta";
import { submitSitesRouter } from "./routers/submit-sites";
import { subscriberRouter } from "./routers/subscriber";
import { uploadRouter } from "./routers/upload";
import { userRouter } from "./routers/user";
import { weeklyRouter } from "./routers/weekly";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = {
  refSites: refSitesRouter,
  weekly: weeklyRouter,
  subscriber: subscriberRouter,
  upload: uploadRouter,
  siteMeta: siteMetaRouter,
  submitSite: submitSitesRouter,
  user: userRouter,
};

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['refSites']['query']
 */
export type RouterInputs = InferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['refSites']['query']
 */
export type RouterOutputs = InferRouterOutputs<AppRouter>;
