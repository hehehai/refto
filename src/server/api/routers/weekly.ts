import { ORPCError } from "@orpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  type SQL,
} from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { chunk } from "es-toolkit";
import { z } from "zod";

import {
  db,
  refSite,
  subscriber,
  type Weekly,
  type WeeklySentStatus,
  weekly,
} from "@/db";
import { batchSendEmail } from "@/lib/email";
import { WeeklyEmail } from "@/lib/email/templates/weekly";
import { pagination } from "@/lib/pagination";
import { formatOrders, genOrderValidSchema, getBaseUrl } from "@/lib/utils";
import { updateWeeklySchema, weeklySchema } from "@/lib/validations/weekly";
import { adminProcedure, protectedProcedure } from "@/server/api/orpc";
import { detail } from "@/server/functions/weekly";

type OrderByItem = { key: string; dir: "asc" | "desc" };

function buildWeeklyOrderByClause(orderBy: OrderByItem[] | undefined): SQL[] {
  if (!orderBy?.length) return [];

  const columnMap: Record<string, PgColumn> = {
    id: weekly.id,
    weekStart: weekly.weekStart,
    weekEnd: weekly.weekEnd,
    sentDate: weekly.sentDate,
    createdAt: weekly.createdAt,
  };

  return orderBy
    .map((item) => {
      const column = columnMap[item.key];
      if (!column) return null;
      return item.dir === "desc" ? desc(column) : asc(column);
    })
    .filter((item): item is SQL => item !== null);
}

// 列表查询
const queryProcedure = adminProcedure
  .input(
    z.object({
      search: z.coerce.string().trim().max(1024).optional(),
      limit: z.number().min(1).max(50).optional().default(10),
      page: z.number().min(0).optional().default(0),
      status: z.enum(["AWAITING", "PENDING", "SENT"] as const).optional(),
      orderBy: genOrderValidSchema<Weekly>(["weekStart", "sentDate"])
        .optional()
        .default(["-weekStart"])
        .transform(formatOrders),
    })
  )
  .handler(async ({ input }) => {
    const { search, limit, page, status, orderBy } = input;

    const conditions: SQL[] = [];

    if (search) {
      conditions.push(ilike(weekly.title, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(weekly.status, status as WeeklySentStatus));
    }

    const orderByClause = buildWeeklyOrderByClause(orderBy);

    const rows = await db
      .select({
        id: weekly.id,
        title: weekly.title,
        weekStart: weekly.weekStart,
        weekEnd: weekly.weekEnd,
        status: weekly.status,
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
  .handler(async () => {
    // 周内容是否已发送，或正在发送
    // 无法删除
  });

// 发送
const sendProcedure = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const weeklyData = await db.query.weekly.findFirst({
      where: eq(weekly.id, input.id),
    });

    if (!weeklyData) {
      throw new ORPCError("NOT_FOUND", { message: "Weekly not found" });
    }
    if (weeklyData.status === "PENDING") {
      throw new ORPCError("BAD_REQUEST", {
        message: "Weekly is pending, can not be sent",
      });
    }
    if (weeklyData.status === "SENT") {
      throw new ORPCError("BAD_REQUEST", {
        message: "Weekly is sent, can not be sent again",
      });
    }

    const currentSubscribers = await db
      .select({
        id: subscriber.id,
        email: subscriber.email,
        unSubSign: subscriber.unSubSign,
      })
      .from(subscriber)
      .where(isNull(subscriber.unSubDate));

    if (currentSubscribers.length === 0) {
      return null;
    }

    const sites = await db
      .select({
        id: refSite.id,
        siteTitle: refSite.siteTitle,
        siteUrl: refSite.siteUrl,
        siteCover: refSite.siteCover,
        siteTags: refSite.siteTags,
      })
      .from(refSite)
      .where(inArray(refSite.id, weeklyData.sites));

    if (sites.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Weekly sites not found" });
    }

    // 如果数量大于 100， 则按 100 切块
    const chunkSize = 100;
    let chunks = [currentSubscribers];
    if (currentSubscribers.length > chunkSize) {
      chunks = chunk(currentSubscribers, chunkSize);
    }

    const baseUrl = getBaseUrl();

    for (const chunkItem of chunks) {
      await batchSendEmail({
        subject: weeklyData.title,
        to: chunkItem.map((item) => item.email),
        renderData: chunkItem.map((item) =>
          WeeklyEmail({
            count: 24,
            sites: sites.map((site) => ({
              id: site.id,
              cover: site.siteCover,
              title: site.siteTitle,
              url: site.siteUrl,
              tags: site.siteTags,
            })),
            unsubscribeUrl: `${baseUrl}/unsub?email=${item.email}&token=${item.unSubSign}`,
            baseUrl,
          })
        ),
      });
    }

    const [updated] = await db
      .update(weekly)
      .set({
        status: "SENT",
        sentDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(weekly.id, input.id))
      .returning();

    return updated;
  });

export const weeklyRouter = {
  query: queryProcedure,
  create: createProcedure,
  detail: detailProcedure,
  update: updateProcedure,
  delete: deleteProcedure,
  send: sendProcedure,
};
