// 查询 - 排序
// 创建 - 选择统计， 编辑简介
// 更新 - 修改统计，编辑简介
// 发送 - 向订阅者推送
// 删除 - 仅未发生状态下可删除
// cron: 每周统计一次， 当前访问数较上周增长数量

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { formatOrders, genOrderValidSchema } from "@/lib/utils";
import { type Prisma, type Weekly } from "@prisma/client";
import { db } from "@/lib/db";

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
        cursor: z.string().nullish(),
        orderBy: genOrderValidSchema<Weekly>(["weekStart", "sentDate"])
          .optional()
          .default(["-weekStart"])
          .transform(formatOrders),
      }),
    )
    .query(async ({ input }) => {
      const { search, limit, cursor, orderBy } = input;

      const whereInput: Prisma.WeeklyWhereInput = {
        title: {
          contains: search,
          mode: "insensitive",
        },
      };

      const rows = await db.weekly.findMany({
        where: whereInput,
        select: {
          id: true,
          title: true,
        },
        cursor: cursor ? { id: cursor } : undefined,
        take: limit + 1,
        orderBy: orderBy?.reduce(
          (acc, item) => ({ ...acc, [item.key]: item.dir }),
          {},
        ),
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (rows && rows.length > limit) {
        const nextItem = rows.pop();
        nextCursor = nextItem?.id;
      }

      return {
        rows,
        nextCursor,
      };
    }),

  // 创建
  create: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(
      z.object({
        title: z.string().trim().min(1).max(255),
        sites: z.array(z.string()).min(1).max(10),
        weekStart: z.date(),
        weekEnd: z.date(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.weekly.create({
        data: {
          ...input,
          sites: {
            connect: input.sites.map((site) => ({ id: site })),
          },
        },
      });
    }),

  // 更新
  update: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(
      z.object({
        id: z.string(),
        title: z.string().trim().min(1).max(255).optional(),
        sites: z.array(z.string()).min(1).max(10).optional(),
        weekStart: z.date().optional(),
        weekEnd: z.date().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.weekly.update({
        where: {
          id: input.id,
        },
        data: {
          ...input,
          sites: {
            set: input.sites?.map((site) => ({ id: site })),
          },
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
      }),
    )
    .mutation(async ({}) => {
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
      }),
    )
    .mutation(async ({ input }) => {
      // 获取周内容，是否有效
      // 获取订阅者
      // 发送邮件
      // 修改周状态，订阅者状态
      return await db.weekly.update({
        where: {
          id: input.id,
        },
        data: {
          sentDate: new Date(),
        },
      });
    }),
});
