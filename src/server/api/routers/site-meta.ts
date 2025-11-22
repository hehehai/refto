import { z } from "zod";
import { getSiteMetaByUrl } from "@/lib/site-meta";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const siteMetaRouter = createTRPCRouter({
  // meta
  meta: publicProcedure
    .input(
      z.object({
        url: z.string().url(),
      })
    )
    .query(async ({ input }) => getSiteMetaByUrl(input.url)),
});
