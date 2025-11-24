import { and, count, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db, refSite } from "@/db";
import {
  queryRefSiteSchema,
  queryWithCursorRefSiteSchema,
  refSiteSchema,
  updateRefSiteSchema,
} from "@/lib/validations/ref-site";
import { adminProcedure, publicProcedure } from "@/server/api/orpc";
import {
  correlation,
  detail,
  query,
  queryWithCursor,
} from "@/server/functions/ref-sites";

// 游标分页查询（公开）
const queryWithCursorProcedure = publicProcedure
  .input(queryWithCursorRefSiteSchema)
  .handler(async ({ input }) => queryWithCursor(input));

// 管理后台分页查询
const queryProcedure = adminProcedure
  .input(queryRefSiteSchema)
  .handler(async ({ input }) => query(input));

// 创建
const createProcedure = adminProcedure
  .input(refSiteSchema)
  .handler(async ({ context, input }) => {
    const id = crypto.randomUUID();
    const [newSite] = await db
      .insert(refSite)
      .values({
        id,
        createdById: context.session!.user.id,
        ...input,
      })
      .returning();
    return newSite;
  });

// 更新
const updateProcedure = adminProcedure
  .input(updateRefSiteSchema)
  .handler(async ({ input }) => {
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
  });

// 详情
const detailProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => detail(input.id));

// 关联
const correlationProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const site = await detail(input.id);
    if (!site) return null;
    return correlation(site.siteTags, [site.id]);
  });

// 删除（软删除）
const deleteProcedure = adminProcedure
  .input(z.object({ ids: z.array(z.string()).min(1).max(50) }))
  .handler(async ({ input }) => {
    const result = await db
      .update(refSite)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(inArray(refSite.id, input.ids), isNull(refSite.deletedAt)))
      .returning({ id: refSite.id });
    return { count: result.length };
  });

// 置顶切换
const switchTopProcedure = adminProcedure
  .input(z.object({ id: z.string(), nextIsTop: z.boolean() }))
  .handler(async ({ input }) => {
    const [updated] = await db
      .update(refSite)
      .set({
        isTop: input.nextIsTop,
        updatedAt: new Date(),
      })
      .where(and(eq(refSite.id, input.id), isNull(refSite.deletedAt)))
      .returning();
    return updated;
  });

// 点赞（待实现）
const incLikeProcedure = publicProcedure.input(z.string()).handler(async () => {
  // TODO
});

// 访问量增加
const incVisitProcedure = publicProcedure
  .input(z.string())
  .handler(async ({ input }) => {
    const [updated] = await db
      .update(refSite)
      .set({
        visits: sql`${refSite.visits} + 1`,
      })
      .where(eq(refSite.id, input))
      .returning();
    return updated;
  });

// 获取本周新增数量
const weeklyCountProcedure = publicProcedure.handler(async () => {
  // Get the start of the current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({ count: count() })
    .from(refSite)
    .where(and(gte(refSite.createdAt, startOfWeek), isNull(refSite.deletedAt)));

  return { count: result?.count ?? 0 };
});

export const refSitesRouter = {
  queryWithCursor: queryWithCursorProcedure,
  query: queryProcedure,
  create: createProcedure,
  update: updateProcedure,
  detail: detailProcedure,
  correlation: correlationProcedure,
  delete: deleteProcedure,
  switchTop: switchTopProcedure,
  incLike: incLikeProcedure,
  incVisit: incVisitProcedure,
  weeklyCount: weeklyCountProcedure,
};
