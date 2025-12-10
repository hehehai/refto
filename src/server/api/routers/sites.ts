import { and, count, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import {
  sitePages,
  sitePageVersionLikes,
  sitePageVersions,
  sites,
} from "@/lib/db/schema";
import {
  deleteSiteSchema,
  querySiteSchema,
  queryWithCursorSiteSchema,
  siteCreateSchema,
  siteUpdateSchema,
  switchPinnedSchema,
} from "@/lib/validations/site";
import { adminProcedure, publicProcedure } from "@/server/api/orpc";
import {
  correlation,
  detail,
  query,
  queryWithCursor,
} from "@/server/functions/sites";

// 游标分页查询（公开）
const queryWithCursorProcedure = publicProcedure
  .input(queryWithCursorSiteSchema)
  .handler(async ({ input }) => queryWithCursor(input));

// 管理后台分页查询
const queryProcedure = adminProcedure
  .input(querySiteSchema)
  .handler(async ({ input }) => query(input));

// 创建
const createProcedure = adminProcedure
  .input(siteCreateSchema)
  .handler(async ({ context, input }) => {
    return await db.transaction(async (tx) => {
      // 1. Create site
      const siteId = crypto.randomUUID();
      const [newSite] = await tx
        .insert(sites)
        .values({
          id: siteId,
          title: input.title,
          description: input.description,
          logo: input.logo,
          url: input.url,
          tags: input.tags,
          rating: input.rating || 0,
          isPinned: input.isPinned,
          createdById: context.session!.user.id,
        })
        .returning();

      // 2. Create default page
      const pageId = crypto.randomUUID();
      const [_newPage] = await tx
        .insert(sitePages)
        .values({
          id: pageId,
          siteId,
          title: input.title,
          url: input.url,
          isDefault: true,
        })
        .returning();

      // 3. Create initial version
      const versionId = crypto.randomUUID();
      await tx.insert(sitePageVersions).values({
        id: versionId,
        pageId,
        versionDate: input.versionDate || new Date(),
        versionNote: input.versionNote || "Initial version",
        siteOG: input.siteOG || null,
        webCover: input.webCover,
        webRecord: input.webRecord || null,
        mobileCover: input.mobileCover || null,
        mobileRecord: input.mobileRecord || null,
      });

      return newSite;
    });
  });

// 更新
const updateProcedure = adminProcedure
  .input(siteUpdateSchema)
  .handler(async ({ input }) => {
    const { id, ...data } = input;

    return await db.transaction(async (tx) => {
      // Update site-level fields
      const siteFields: any = {};
      if (data.title !== undefined) siteFields.title = data.title;
      if (data.description !== undefined)
        siteFields.description = data.description;
      if (data.logo !== undefined) siteFields.logo = data.logo;
      if (data.url !== undefined) siteFields.url = data.url;
      if (data.tags !== undefined) siteFields.tags = data.tags;
      if (data.rating !== undefined) siteFields.rating = data.rating;
      if (data.isPinned !== undefined) siteFields.isPinned = data.isPinned;

      if (Object.keys(siteFields).length > 0) {
        siteFields.updatedAt = new Date();
        await tx.update(sites).set(siteFields).where(eq(sites.id, id));
      }

      // If version-related fields are updated, create a new version
      const hasVersionUpdate =
        data.siteOG !== undefined ||
        data.webCover !== undefined ||
        data.webRecord !== undefined ||
        data.mobileCover !== undefined ||
        data.mobileRecord !== undefined;

      if (hasVersionUpdate) {
        // Get default page
        const defaultPage = await tx.query.sitePages.findFirst({
          where: and(eq(sitePages.siteId, id), eq(sitePages.isDefault, true)),
        });

        if (defaultPage) {
          const versionId = crypto.randomUUID();
          await tx.insert(sitePageVersions).values({
            id: versionId,
            pageId: defaultPage.id,
            versionDate: data.versionDate || new Date(),
            versionNote: data.versionNote || "Updated version",
            siteOG: data.siteOG || null,
            webCover: data.webCover!,
            webRecord: data.webRecord || null,
            mobileCover: data.mobileCover || null,
            mobileRecord: data.mobileRecord || null,
          });
        }
      }

      const [updated] = await tx.select().from(sites).where(eq(sites.id, id));

      return updated;
    });
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
    return correlation(site.tags, [site.id]);
  });

// 删除（软删除）
const deleteProcedure = adminProcedure
  .input(deleteSiteSchema)
  .handler(async ({ input }) => {
    const result = await db
      .update(sites)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(inArray(sites.id, input.ids), isNull(sites.deletedAt)))
      .returning({ id: sites.id });
    return { count: result.length };
  });

// 置顶切换
const switchPinnedProcedure = adminProcedure
  .input(switchPinnedSchema)
  .handler(async ({ input }) => {
    const [updated] = await db
      .update(sites)
      .set({
        isPinned: input.nextIsPinned,
        updatedAt: new Date(),
      })
      .where(and(eq(sites.id, input.id), isNull(sites.deletedAt)))
      .returning();
    return updated;
  });

// 点赞
const incLikeProcedure = publicProcedure
  .input(z.object({ versionId: z.string(), userId: z.string() }))
  .handler(async ({ input }) => {
    // Toggle like
    const existing = await db.query.sitePageVersionLikes.findFirst({
      where: and(
        eq(sitePageVersionLikes.versionId, input.versionId),
        eq(sitePageVersionLikes.userId, input.userId)
      ),
    });

    if (existing) {
      // Unlike
      await db
        .delete(sitePageVersionLikes)
        .where(eq(sitePageVersionLikes.id, existing.id));
      return { liked: false };
    }
    // Like
    const likeId = crypto.randomUUID();
    await db.insert(sitePageVersionLikes).values({
      id: likeId,
      versionId: input.versionId,
      userId: input.userId,
    });
    return { liked: true };
  });

// 访问量增加
const incVisitProcedure = publicProcedure
  .input(z.string())
  .handler(async ({ input: siteId }) => {
    const [updated] = await db
      .update(sites)
      .set({
        visits: sql`${sites.visits} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, siteId))
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
    .from(sites)
    .where(and(gte(sites.createdAt, startOfWeek), isNull(sites.deletedAt)));

  return { count: result?.count ?? 0 };
});

export const sitesRouter = {
  queryWithCursor: queryWithCursorProcedure,
  query: queryProcedure,
  create: createProcedure,
  update: updateProcedure,
  detail: detailProcedure,
  correlation: correlationProcedure,
  delete: deleteProcedure,
  switchPinned: switchPinnedProcedure,
  incLike: incLikeProcedure,
  incVisit: incVisitProcedure,
  weeklyCount: weeklyCountProcedure,
};
