import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { formatOrders, genOrderValidSchema } from "@/lib/utils";
import { type Prisma, type RefSite } from "@prisma/client";
import { db } from "@/lib/db";
import { pagination } from "@/lib/pagination";
import { refSiteSchema, updateRefSiteSchema } from "@/lib/validations/ref-site";
import { correlation, detail } from "@/server/functions/ref-sites";

export const refSitesRouter = createTRPCRouter({
  // 列表
  queryWithCursor: publicProcedure
    .input(
      z.object({
        search: z.coerce.string().trim().max(1024).optional(),
        limit: z.number().min(1).max(50).optional().default(10),
        cursor: z.string().nullish(),
        orderBy: genOrderValidSchema<RefSite>(["createdAt", "likes", "visits"])
          .optional()
          .transform((v) => (v?.length ? v : ["-createdAt"]))
          .transform(formatOrders),
        tags: z.array(z.string()).max(20).optional().default([]),
        hasTop: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ input }) => {
      const { search, limit, cursor, orderBy, tags, hasTop } = input;

      const whereInput: Prisma.RefSiteWhereInput = {
        deletedAt: null,
        isTop: hasTop ? true : false,
      };

      if (search) {
        whereInput.OR = [
          {
            siteName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            siteTitle: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            siteUrl: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      if (tags.length) {
        whereInput.siteTags = {
          hasSome: tags,
        };
      }

      const rows = await db.refSite.findMany({
        where: whereInput,
        select: {
          id: true,
          siteUrl: true,
          siteName: true,
          siteFavicon: true,
          siteCover: true,
          siteCoverHeight: true,
          siteCoverWidth: true,
          likes: true,
          visits: true,
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
        orderBy: genOrderValidSchema<RefSite>(["createdAt", "likes", "visits"])
          .optional()
          .default(["-createdAt"])
          .transform(formatOrders),
        tags: z.array(z.string()).max(20).optional().default([]),
      }),
    )
    .query(async ({ input }) => {
      const { search, limit, page, orderBy, tags } = input;

      const whereInput: Prisma.RefSiteWhereInput = {
        deletedAt: null,
      };

      if (search) {
        whereInput.OR = [
          {
            siteName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            siteTitle: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            siteUrl: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      if (tags.length) {
        whereInput.siteTags = {
          hasSome: tags,
        };
      }

      const rows = await db.refSite.findMany({
        where: whereInput,
        select: {
          id: true,
          siteUrl: true,
          siteName: true,
          siteTitle: true,
          siteFavicon: true,
          createdAt: true,
          likes: true,
          visits: true,
          isTop: true,
        },
        skip: page * limit,
        take: limit,
        orderBy: orderBy?.reduce(
          (acc, item) => ({ ...acc, [item.key]: item.dir }),
          {},
        ),
      });

      const total = await db.refSite.count({
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
    .input(refSiteSchema)
    .mutation(async ({ ctx, input }) => {
      return await db.refSite.create({
        data: {
          createdById: ctx.session.user.id,
          ...input,
        },
      });
    }),

  // 更新
  update: protectedProcedure
    .meta({
      requiredRoles: ["ADMIN"],
    })
    .input(updateRefSiteSchema)
    .mutation(async ({ ctx, input }) => {
      return await db.refSite.update({
        where: {
          id: input.id,
        },
        data: {
          ...input,
        },
      });
    }),

  // 详情
  detail: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return detail(input.id);
    }),

  // 关联
  correlation: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await db.refSite.updateMany({
        where: {
          id: {
            in: input.ids,
          },
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await db.refSite.update({
        where: {
          id: input.id,
          deletedAt: null,
        },
        data: {
          isTop: input.nextIsTop,
        },
      });
    }),

  // likes
  incLike: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    return await db.refSite.update({
      where: {
        id: input,
      },
      data: {
        likes: {
          increment: 1,
        },
      },
    });
  }),

  // visitors
  incVisit: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    return await db.refSite.update({
      where: {
        id: input,
      },
      data: {
        visits: {
          increment: 1,
        },
      },
    });
  }),
});
