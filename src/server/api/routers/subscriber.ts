import { TRPCError } from "@trpc/server";
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
import { SupportLocale } from "@/i18n";
import { pagination } from "@/lib/pagination";
import { formatOrders, genOrderValidSchema } from "@/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
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

export const subscriberRouter = createTRPCRouter({
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
        status: z.enum(["subscribed", "unsubscribed"]).optional(),
        orderBy: genOrderValidSchema<Subscriber>(["createdAt", "unSubDate"])
          .optional()
          .transform((v) => (v?.length ? v : ["-createdAt"]))
          .transform(formatOrders),
      })
    )
    .query(async ({ input }) => {
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
    }),

  // 订阅
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        locale: z
          .nativeEnum(SupportLocale)
          .optional()
          .default(SupportLocale.en),
      })
    )
    .mutation(async ({ input }) => subscribe(input.email, input.locale)),

  // 取消订阅
  unsubscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => unsubscribe(input)),

  unsubscribeBatch: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(
      z.object({
        emails: z.array(z.string().email()).min(1).max(50),
      })
    )
    .mutation(async ({ input }) => {
      const { emails } = input;

      const subscribers = await db
        .select()
        .from(subscriber)
        .where(inArray(subscriber.email, emails));

      const canUnSubs = subscribers.filter((item) => !item.unSubDate);
      if (canUnSubs.length !== emails.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
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
    }),
});
