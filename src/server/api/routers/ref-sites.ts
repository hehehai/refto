import { z } from "zod";

import { db } from "@/lib/db";
import {
  queryRefSiteSchema,
  queryWithCursorRefSiteSchema,
  refSiteSchema,
  updateRefSiteSchema,
} from "@/lib/validations/ref-site";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  correlation,
  detail,
  query,
  queryWithCursor,
} from "@/server/functions/ref-sites";

export const refSitesRouter = createTRPCRouter({
  // 列表
  queryWithCursor: publicProcedure
    .input(queryWithCursorRefSiteSchema)
    .query(async ({ input }) => queryWithCursor(input)),

  // 列表
  query: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(queryRefSiteSchema)
    .query(async ({ input }) => query(input)),

  // 创建
  create: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(refSiteSchema)
    .mutation(
      async ({ ctx, input }) =>
        await db.refSite.create({
          data: {
            createdById: ctx.session.user.id,
            ...input,
          },
        })
    ),

  // 更新
  update: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(updateRefSiteSchema)
    .mutation(
      async ({ input }) =>
        await db.refSite.update({
          where: {
            id: input.id,
          },
          data: {
            ...input,
          },
        })
    ),

  // 详情
  detail: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => detail(input.id)),

  // 关联
  correlation: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const site = await detail(input.id);
      if (!site) return null;

      return correlation(site.siteTags, [site.id]);
    }),

  // 删除
  delete: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(
      z.object({
        ids: z.array(z.string()).min(1).max(50),
      })
    )
    .mutation(
      async ({ input }) =>
        await db.refSite.updateMany({
          where: {
            id: {
              in: input.ids,
            },
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        })
    ),

  // 置顶
  switchTop: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(
      z.object({
        id: z.string(),
        nextIsTop: z.boolean(),
      })
    )
    .mutation(
      async ({ input }) =>
        await db.refSite.update({
          where: {
            id: input.id,
            deletedAt: null,
          },
          data: {
            isTop: input.nextIsTop,
          },
        })
    ),

  // likes
  incLike: publicProcedure.input(z.string()).mutation(async () => {
    // TODO
  }),

  // visitors
  incVisit: publicProcedure.input(z.string()).mutation(
    async ({ input }) =>
      await db.refSite.update({
        where: {
          id: input,
        },
        data: {
          visits: {
            increment: 1,
          },
        },
      })
  ),
});
