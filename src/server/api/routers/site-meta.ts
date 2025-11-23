import { z } from "zod";
import { getSiteMetaByUrl } from "@/lib/site-meta";
import { publicProcedure } from "@/server/api/orpc";

// 获取网站元数据
const metaProcedure = publicProcedure
  .input(z.object({ url: z.string().url() }))
  .handler(async ({ input }) => getSiteMetaByUrl(input.url));

export const siteMetaRouter = {
  meta: metaProcedure,
};
