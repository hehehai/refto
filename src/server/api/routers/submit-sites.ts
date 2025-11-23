import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { z } from "zod";

import { db, type SubmitSite, type SubmitSiteStatus, submitSite } from "@/db";
import { pagination } from "@/lib/pagination";
import { formatOrders, genOrderValidSchema } from "@/lib/utils";
import { submitSiteCreateSchema } from "@/lib/validations/submit-site";
import { adminProcedure, publicProcedure } from "@/server/api/orpc";

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

// 推荐网站
const recommendProcedure = publicProcedure
  .input(submitSiteCreateSchema("en"))
  .handler(async ({ input }) => {
    const { email, site, title, description } = input;

    const [newSubmit] = await db
      .insert(submitSite)
      .values({
        siteUrl: site,
        email,
        siteTitle: title,
        siteDescription: description,
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
    const { search, limit, page, status, orderBy } = input;

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

    const orderByClause = buildSubmitSiteOrderByClause(orderBy);

    const rows = await db
      .select()
      .from(submitSite)
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

export const submitSitesRouter = {
  recommend: recommendProcedure,
  query: queryProcedure,
};
