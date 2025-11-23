import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db, refSite } from "@/db";
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
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      const [newSite] = await db
        .insert(refSite)
        .values({
          id,
          createdById: ctx.session.user.id,
          ...input,
        })
        .returning();
      return newSite;
    }),

  // 更新
  update: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(updateRefSiteSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [updated] = await db
        .update(refSite)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(refSite.id, id))
        .returning();
      return updated;
    }),

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
    .mutation(async ({ input }) => {
      const result = await db
        .update(refSite)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(inArray(refSite.id, input.ids), isNull(refSite.deletedAt)))
        .returning({ id: refSite.id });
      return { count: result.length };
    }),

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
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(refSite)
        .set({
          isTop: input.nextIsTop,
          updatedAt: new Date(),
        })
        .where(and(eq(refSite.id, input.id), isNull(refSite.deletedAt)))
        .returning();
      return updated;
    }),

  // likes
  incLike: publicProcedure.input(z.string()).mutation(async () => {
    // TODO
  }),

  // visitors
  incVisit: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    const [updated] = await db
      .update(refSite)
      .set({
        visits: sql`${refSite.visits} + 1`,
      })
      .where(eq(refSite.id, input))
      .returning();

    return updated;
  }),
});
