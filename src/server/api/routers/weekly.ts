import { type Prisma, type Weekly, WeeklySentStatus } from "@prisma/client";
import { chunk } from "es-toolkit";
import { z } from "zod";
import type { SupportLocale } from "@/i18n";
import { db } from "@/lib/db";
import { batchSendEmail } from "@/lib/email";
import { WeeklyEmail } from "@/lib/email/templates/weekly";
import { pagination } from "@/lib/pagination";
import { formatOrders, genOrderValidSchema, getBaseUrl } from "@/lib/utils";
import { updateWeeklySchema, weeklySchema } from "@/lib/validations/weekly";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { detail } from "@/server/functions/weekly";

export const weeklyRouter = createTRPCRouter({
  // 列表
  query: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(
      z.object({
        search: z.coerce.string().trim().max(1024).optional(),
        limit: z.number().min(1).max(50).optional().default(10),
        page: z.number().min(0).optional().default(0),
        status: z.nativeEnum(WeeklySentStatus).optional(),
        orderBy: genOrderValidSchema<Weekly>(["weekStart", "sentDate"])
          .optional()
          .default(["-weekStart"])
          .transform(formatOrders),
      })
    )
    .query(async ({ input }) => {
      const { search, limit, page, status, orderBy } = input;

      const whereInput: Prisma.WeeklyWhereInput = {
        title: {
          contains: search,
          mode: "insensitive",
        },
      };

      if (status) {
        whereInput.status = status;
      }

      const rows = await db.weekly.findMany({
        where: whereInput,
        select: {
          id: true,
          title: true,
          weekStart: true,
          weekEnd: true,
          status: true,
        },
        skip: page * limit,
        take: limit,
        orderBy: orderBy?.reduce(
          (acc, item) => ({ ...acc, [item.key]: item.dir }),
          {}
        ),
      });

      const total = await db.weekly.count({
        where: whereInput,
      });

      return {
        rows,
        ...pagination(page, limit, total),
      };
    }),

  // 创建
  create: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(weeklySchema)
    .mutation(async ({ input }) => {
      const [weekStart, weekEnd] = input.weekRange as [Date, Date];
      return await db.weekly.create({
        data: {
          title: input.title,
          weekStart,
          weekEnd,
          sites: input.sites.filter(Boolean),
        },
      });
    }),

  // 详情
  detail: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => detail(input.id)),

  // 更新
  update: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(updateWeeklySchema)
    .mutation(async ({ input }) => {
      const [weekStart, weekEnd] = input.weekRange as [Date, Date];

      return await db.weekly.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          weekStart,
          weekEnd,
          sites: input.sites?.filter(Boolean),
        },
      });
    }),

  // 删除
  delete: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async () => {
      // 周内容是否已发送，或正在发送
      // 无法删除
    }),

  // 发送
  send: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const weekly = await db.weekly.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!weekly) {
        throw new Error("Weekly not found");
      }
      if (weekly.status === WeeklySentStatus.PENDING) {
        throw new Error("Weekly is pending, can not be sent");
      }
      if (weekly.status === WeeklySentStatus.SENT) {
        throw new Error("Weekly is sent, can not be sent again");
      }
      const currentSubscribers = await db.subscriber.findMany({
        where: {
          unSubDate: null,
        },
        select: {
          id: true,
          email: true,
          unSubSign: true,
          locale: true,
        },
      });
      if (currentSubscribers.length === 0) {
        return null;
      }
      const sites = await db.refSite.findMany({
        where: {
          id: {
            in: weekly.sites,
          },
        },
        select: {
          id: true,
          siteTitle: true,
          siteUrl: true,
          siteCover: true,
          siteTags: true,
        },
      });
      if (sites.length === 0) {
        throw new Error("Weekly sites not found");
      }

      // 如果数量大于 100， 则按 100 切块
      const chunkSize = 100;
      let chunks = [currentSubscribers];
      if (currentSubscribers.length > chunkSize) {
        chunks = chunk(currentSubscribers, chunkSize);
      }

      const baseUrl = getBaseUrl();

      for (const chunk of chunks) {
        await batchSendEmail({
          subject: weekly.title,
          to: chunk.map((item) => item.email),
          renderData: chunk.map((item) =>
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
              locale: item.locale as SupportLocale,
            })
          ),
        });
      }

      return await db.weekly.update({
        where: {
          id: input.id,
        },
        data: {
          status: WeeklySentStatus.SENT,
          sentDate: new Date(),
        },
      });
    }),
});
