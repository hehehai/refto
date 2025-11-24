import { ORPCError } from "@orpc/server";
import {
  and,
  asc,
  count,
  desc,
  ilike,
  inArray,
  isNotNull,
  isNull,
  type SQL,
} from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { z } from "zod";

import { db, type Subscriber, subscriber } from "@/db";
import { pagination } from "@/lib/pagination";
import { formatOrders, genOrderValidSchema } from "@/lib/utils";
import { adminProcedure, publicProcedure } from "@/server/api/orpc";
import { subscribe, unsubscribe } from "@/server/functions/subscriber";

type OrderByItem = { key: string; dir: "asc" | "desc" };

function buildSubscriberOrderByClause(
  orderBy: OrderByItem[] | undefined
): SQL[] {
  if (!orderBy?.length) return [];

  const columnMap: Record<string, PgColumn> = {
    id: subscriber.id,
    createdAt: subscriber.createdAt,
    unSubDate: subscriber.unSubDate,
    email: subscriber.email,
  };

  return orderBy
    .map((item) => {
      const column = columnMap[item.key];
      if (!column) return null;
      return item.dir === "desc" ? desc(column) : asc(column);
    })
    .filter((item): item is SQL => item !== null);
}

// 查询
const queryProcedure = adminProcedure
  .input(
    z.object({
      search: z.coerce.string().trim().max(1024).optional(),
      limit: z.number().min(1).max(50).optional().default(10),
      page: z.number().min(0).optional().default(0),
      status: z.enum(["subscribed", "unsubscribed"]).optional(),
      orderBy: genOrderValidSchema<Subscriber>(["createdAt", "unSubDate"])
        .optional()
        .transform((v) => (v?.length ? v : ["-createdAt"]))
        .transform(formatOrders),
    })
  )
  .handler(async ({ input }) => {
    const { search, limit, page, status, orderBy } = input;

    const conditions: SQL[] = [];

    if (search) {
      conditions.push(ilike(subscriber.email, `%${search}%`));
    }

    if (status === "unsubscribed") {
      conditions.push(isNotNull(subscriber.unSubDate));
    } else if (status === "subscribed") {
      conditions.push(isNull(subscriber.unSubDate));
    }

    const orderByClause = buildSubscriberOrderByClause(orderBy);

    const rows = await db
      .select({
        id: subscriber.id,
        email: subscriber.email,
        unSubDate: subscriber.unSubDate,
        createdAt: subscriber.createdAt,
        locale: subscriber.locale,
        weekly: subscriber.weekly,
      })
      .from(subscriber)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(...orderByClause)
      .limit(limit)
      .offset(page * limit);

    const [totalResult] = await db
      .select({ count: count() })
      .from(subscriber)
      .where(conditions.length ? and(...conditions) : undefined);

    const total = totalResult?.count ?? 0;

    return {
      rows,
      ...pagination(page, limit, total),
    };
  });

// 订阅
const subscribeProcedure = publicProcedure
  .input(
    z.object({
      email: z.email(),
    })
  )
  .handler(async ({ input }) => subscribe(input.email));

// 取消订阅
const unsubscribeProcedure = publicProcedure
  .input(
    z.object({
      email: z.email(),
      token: z.string(),
    })
  )
  .handler(async ({ input }) => unsubscribe(input));

// 批量取消订阅
const unsubscribeBatchProcedure = adminProcedure
  .input(
    z.object({
      emails: z.array(z.email()).min(1).max(50),
    })
  )
  .handler(async ({ input }) => {
    const { emails } = input;

    const subscribers = await db
      .select()
      .from(subscriber)
      .where(inArray(subscriber.email, emails));

    const canUnSubs = subscribers.filter((item) => !item.unSubDate);
    if (canUnSubs.length !== emails.length) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Some subscribers are already unsubscribed",
      });
    }

    await db
      .update(subscriber)
      .set({
        unSubDate: new Date(),
        updatedAt: new Date(),
      })
      .where(inArray(subscriber.email, emails));

    return canUnSubs.length;
  });

export const subscriberRouter = {
  query: queryProcedure,
  subscribe: subscribeProcedure,
  unsubscribe: unsubscribeProcedure,
  unsubscribeBatch: unsubscribeBatchProcedure,
};
