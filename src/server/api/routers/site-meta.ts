import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getSiteMetaByUrl } from "@/lib/site-meta";

export const siteMetaRouter = createTRPCRouter({
  // meta
  meta: publicProcedure
    .input(
      z.object({
        url: z.string().url(),
      }),
    )
    .query(async ({ input }) => {
      return getSiteMetaByUrl(input.url);
    }),
});
