import { and, count, eq, ilike, type SQL } from "drizzle-orm";
import { z } from "zod";

import { db, type Weekly, weekly } from "@/lib/db";
import { buildOrderByClause } from "@/lib/db-utils";
import { pagination } from "@/lib/pagination";
import { formatOrders, genOrderValidSchema } from "@/lib/utils";
import { updateWeeklySchema, weeklySchema } from "@/lib/validations/weekly";
import { adminProcedure, protectedProcedure } from "@/server/api/orpc";
import { detail } from "@/server/functions/weekly";

// 列表查询
const queryProcedure = adminProcedure
  .input(
    z.object({
      search: z.coerce.string().trim().max(1024).optional(),
      limit: z.number().min(1).max(50).optional().default(10),
      page: z.number().min(0).optional().default(0),
      orderBy: genOrderValidSchema<Weekly>(["weekStart"])
        .optional()
        .default(["-weekStart"])
        .transform(formatOrders),
    })
  )
  .handler(async ({ input }) => {
    const { search, limit, page, orderBy } = input;

    const conditions: SQL[] = [];

    if (search) {
      conditions.push(ilike(weekly.title, `%${search}%`));
    }

    const orderByClause = buildOrderByClause(orderBy, {
      id: weekly.id,
      weekStart: weekly.weekStart,
      weekEnd: weekly.weekEnd,
      createdAt: weekly.createdAt,
    });

    const rows = await db
      .select({
        id: weekly.id,
        title: weekly.title,
        weekStart: weekly.weekStart,
        weekEnd: weekly.weekEnd,
      })
      .from(weekly)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(...orderByClause)
      .limit(limit)
      .offset(page * limit);

    const [totalResult] = await db
      .select({ count: count() })
      .from(weekly)
      .where(conditions.length ? and(...conditions) : undefined);

    const total = totalResult?.count ?? 0;

    return {
      rows,
      ...pagination(page, limit, total),
    };
  });

// 创建
const createProcedure = adminProcedure
  .input(weeklySchema)
  .handler(async ({ input }) => {
    const [weekStart, weekEnd] = input.weekRange as [Date, Date];
    const id = crypto.randomUUID();

    const [newWeekly] = await db
      .insert(weekly)
      .values({
        id,
        title: input.title,
        weekStart,
        weekEnd,
        sites: input.sites.filter(Boolean),
      })
      .returning();

    return newWeekly;
  });

// 详情
const detailProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => detail(input.id));

// 更新
const updateProcedure = adminProcedure
  .input(updateWeeklySchema)
  .handler(async ({ input }) => {
    const [weekStart, weekEnd] = input.weekRange as [Date, Date];

    const [updated] = await db
      .update(weekly)
      .set({
        title: input.title,
        weekStart,
        weekEnd,
        sites: input.sites?.filter(Boolean),
        updatedAt: new Date(),
      })
      .where(eq(weekly.id, input.id))
      .returning();

    return updated;
  });

// 删除
const deleteProcedure = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await db.delete(weekly).where(eq(weekly.id, input.id));
    return { success: true };
  });

export const weeklyRouter = {
  query: queryProcedure,
  create: createProcedure,
  detail: detailProcedure,
  update: updateProcedure,
  delete: deleteProcedure,
};
