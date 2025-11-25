import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { z } from "zod";

import {
  db,
  type SubmitSite,
  type SubmitSiteStatus,
  submitSite,
  user,
} from "@/db";
import { pagination } from "@/lib/pagination";
import { formatOrders, genOrderValidSchema } from "@/lib/utils";
import { submitSiteCreateSchema } from "@/lib/validations/submit-site";
import { adminProcedure, protectedProcedure } from "@/server/api/orpc";

type OrderByItem = { key: string; dir: "asc" | "desc" };

function buildSubmitSiteOrderByClause(
  orderBy: OrderByItem[] | undefined
): SQL[] {
  if (!orderBy?.length) return [];

  const columnMap: Record<string, PgColumn> = {
    id: submitSite.id,
    createdAt: submitSite.createdAt,
    approvedAt: submitSite.approvedAt,
    rejectedAt: submitSite.rejectedAt,
  };

  return orderBy
    .map((item) => {
      const column = columnMap[item.key];
      if (!column) return null;
      return item.dir === "desc" ? desc(column) : asc(column);
    })
    .filter((item): item is SQL => item !== null);
}

// 推荐网站 - 需要登录
const recommendProcedure = protectedProcedure
  .input(submitSiteCreateSchema)
  .handler(async ({ input, context }) => {
    const { site, title, description } = input;
    const userId = context.session!.user.id;
    const email = context.session!.user.email;

    const [newSubmit] = await db
      .insert(submitSite)
      .values({
        siteUrl: site,
        email,
        siteTitle: title,
        siteDescription: description,
        userId,
      })
      .returning();

    return newSubmit;
  });

// 查询
const queryProcedure = adminProcedure
  .input(
    z.object({
      search: z.coerce.string().trim().max(1024).optional(),
      limit: z.number().min(1).max(50).optional().default(10),
      page: z.number().min(0).optional().default(0),
      status: z
        .enum(["PENDING", "APPROVED", "REJECTED"] as const)
        .optional()
        .default("PENDING"),
      userId: z.string().optional(),
      orderBy: genOrderValidSchema<SubmitSite>([
        "createdAt",
        "approvedAt",
        "rejectedAt",
      ])
        .optional()
        .transform((v) => (v?.length ? v : ["-createdAt"]))
        .transform(formatOrders),
    })
  )
  .handler(async ({ input }) => {
    const { search, limit, page, status, userId, orderBy } = input;

    const conditions: SQL[] = [];

    if (search) {
      const searchCondition = or(
        ilike(submitSite.email, `%${search}%`),
        ilike(submitSite.siteUrl, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    conditions.push(eq(submitSite.status, status as SubmitSiteStatus));

    // Filter by userId
    if (userId) {
      conditions.push(eq(submitSite.userId, userId));
    }

    const orderByClause = buildSubmitSiteOrderByClause(orderBy);

    const rows = await db
      .select({
        id: submitSite.id,
        email: submitSite.email,
        siteUrl: submitSite.siteUrl,
        siteTitle: submitSite.siteTitle,
        siteDescription: submitSite.siteDescription,
        createdAt: submitSite.createdAt,
        updatedAt: submitSite.updatedAt,
        status: submitSite.status,
        approvedAt: submitSite.approvedAt,
        rejectedAt: submitSite.rejectedAt,
        userId: submitSite.userId,
        submitter: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(submitSite)
      .leftJoin(user, eq(submitSite.userId, user.id))
      .where(and(...conditions))
      .orderBy(...orderByClause)
      .limit(limit)
      .offset(page * limit);

    const [totalResult] = await db
      .select({ count: count() })
      .from(submitSite)
      .where(and(...conditions));

    const total = totalResult?.count ?? 0;

    return {
      rows,
      ...pagination(page, limit, total),
    };
  });

// 用户查询自己的提交
const mySubmissionsProcedure = protectedProcedure
  .input(
    z.object({
      search: z.coerce.string().trim().max(1024).optional(),
      limit: z.number().min(1).max(50).optional().default(10),
      page: z.number().min(0).optional().default(0),
    })
  )
  .handler(async ({ input, context }) => {
    const { search, limit, page } = input;
    const userId = context.session!.user.id;

    const conditions: SQL[] = [eq(submitSite.userId, userId)];

    if (search) {
      const searchCondition = or(
        ilike(submitSite.siteUrl, `%${search}%`),
        ilike(submitSite.siteTitle, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const rows = await db
      .select()
      .from(submitSite)
      .where(and(...conditions))
      .orderBy(desc(submitSite.createdAt))
      .limit(limit)
      .offset(page * limit);

    const [totalResult] = await db
      .select({ count: count() })
      .from(submitSite)
      .where(and(...conditions));

    const total = totalResult?.count ?? 0;

    return {
      rows,
      ...pagination(page, limit, total),
    };
  });

export const submitSitesRouter = {
  recommend: recommendProcedure,
  query: queryProcedure,
  mySubmissions: mySubmissionsProcedure,
};
