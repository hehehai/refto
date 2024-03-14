import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { submitSiteCreateSchema } from "@/lib/validations/submit-site";
import { db } from "@/lib/db";
import { type Prisma, type SubmitSite, SubmitSiteStatus } from "@prisma/client";
import { formatOrders, genOrderValidSchema } from "@/lib/utils";
import { pagination } from "@/lib/pagination";

export const submitSitesRouter = createTRPCRouter({
  recommend: publicProcedure
    .input(submitSiteCreateSchema)
    .mutation(async ({ input }) => {
      const { email, site, title, description } = input;

      return db.submitSite.create({
        data: {
          siteUrl: site,
          email,
          siteTitle: title,
          siteDescription: description,
        },
      });
    }),

  // 查询
  query: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(
      z.object({
        search: z.coerce.string().trim().max(1024).optional(),
        limit: z.number().min(1).max(50).optional().default(10),
        page: z.number().min(0).optional().default(0),
        status: z
          .nativeEnum(SubmitSiteStatus)
          .optional()
          .default(SubmitSiteStatus.PENDING),
        orderBy: genOrderValidSchema<SubmitSite>([
          "createdAt",
          "approvedAt",
          "rejectedAt",
        ])
          .optional()
          .transform((v) => (v?.length ? v : ["-createdAt"]))
          .transform(formatOrders),
      }),
    )
    .query(async ({ input }) => {
      const { search, limit, page, status, orderBy } = input;

      const whereInput: Prisma.SubmitSiteWhereInput = {
        OR: [
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            siteUrl: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
        status,
      };

      const rows = await db.submitSite.findMany({
        where: whereInput,
        skip: page * limit,
        take: limit,
        orderBy: orderBy?.reduce(
          (acc, item) => ({ ...acc, [item.key]: item.dir }),
          {},
        ),
      });

      const total = await db.submitSite.count({
        where: whereInput,
      });

      return {
        rows,
        ...pagination(page, limit, total),
      };
    }),
});
