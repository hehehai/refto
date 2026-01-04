import { ORPCError } from "@orpc/server";
import {
  checkLikeStatusSchema,
  toggleLikeSchema,
  userLikesSchema,
} from "@refto-one/common";
import { and, desc, eq, inArray, isNull, lt } from "@refto-one/db";
import { eventLogs } from "@refto-one/db/schema/events";
import {
  sitePages,
  sitePageVersionLikes,
  sitePageVersions,
  sites,
} from "@refto-one/db/schema/sites";
import { protectedProcedure } from "../../index";
import { generateId } from "../../lib/utils";

export const likeRouter = {
  // Toggle like on a version
  toggleLike: protectedProcedure
    .input(toggleLikeSchema)
    .handler(async ({ input, context }) => {
      const { versionId } = input;
      const userId = context.session.user.id;
      const { db } = context;

      // Check if version exists
      const version = await db.query.sitePageVersions.findFirst({
        where: eq(sitePageVersions.id, versionId),
        with: {
          page: {
            with: {
              site: true,
            },
          },
        },
      });

      if (!version || version.page.site.deletedAt) {
        throw new ORPCError("NOT_FOUND", { message: "Version not found" });
      }

      // Check if already liked
      const existingLike = await db.query.sitePageVersionLikes.findFirst({
        where: and(
          eq(sitePageVersionLikes.versionId, versionId),
          eq(sitePageVersionLikes.userId, userId)
        ),
      });

      const metadata = {
        siteId: version.page.site.id,
        pageId: version.page.id,
      };

      if (existingLike) {
        // Unlike: delete the like
        await db
          .delete(sitePageVersionLikes)
          .where(eq(sitePageVersionLikes.id, existingLike.id));

        // Record unlike event
        await db.insert(eventLogs).values({
          id: generateId(),
          eventType: "VERSION_UNLIKED",
          userId,
          targetId: versionId,
          targetType: "version",
          metadata,
        });

        return { liked: false, versionId };
      }

      // Like: create a new like
      await db.insert(sitePageVersionLikes).values({
        id: generateId(),
        versionId,
        userId,
      });

      // Record like event
      await db.insert(eventLogs).values({
        id: generateId(),
        eventType: "VERSION_LIKED",
        userId,
        targetId: versionId,
        targetType: "version",
        metadata,
      });

      return { liked: true, versionId };
    }),

  // Get user's liked versions (for likes page)
  getUserLikes: protectedProcedure
    .input(userLikesSchema)
    .handler(async ({ input, context }) => {
      const { cursor, limit } = input;
      const userId = context.session.user.id;
      const { db } = context;

      // Build cursor condition
      const cursorCondition = cursor
        ? lt(sitePageVersionLikes.createdAt, new Date(cursor))
        : undefined;

      // Get likes with version, page, and site info
      const likes = await db
        .select({
          likeId: sitePageVersionLikes.id,
          likedAt: sitePageVersionLikes.createdAt,
          version: {
            id: sitePageVersions.id,
            webCover: sitePageVersions.webCover,
            webRecord: sitePageVersions.webRecord,
            mobileCover: sitePageVersions.mobileCover,
            mobileRecord: sitePageVersions.mobileRecord,
            versionDate: sitePageVersions.versionDate,
            createdAt: sitePageVersions.createdAt,
          },
          page: {
            id: sitePages.id,
            title: sitePages.title,
            slug: sitePages.slug,
            url: sitePages.url,
          },
          site: {
            id: sites.id,
            title: sites.title,
            slug: sites.slug,
            logo: sites.logo,
            url: sites.url,
          },
        })
        .from(sitePageVersionLikes)
        .innerJoin(
          sitePageVersions,
          eq(sitePageVersionLikes.versionId, sitePageVersions.id)
        )
        .innerJoin(sitePages, eq(sitePageVersions.pageId, sitePages.id))
        .innerJoin(sites, eq(sitePages.siteId, sites.id))
        .where(
          and(
            eq(sitePageVersionLikes.userId, userId),
            isNull(sites.deletedAt),
            cursorCondition
          )
        )
        .orderBy(desc(sitePageVersionLikes.createdAt))
        .limit(limit + 1);

      const hasMore = likes.length > limit;
      const items = hasMore ? likes.slice(0, limit) : likes;
      const nextCursor = hasMore
        ? (items.at(-1)?.likedAt.toISOString() ?? null)
        : null;

      return {
        items: items.map((like) => ({
          version: like.version,
          page: like.page,
          site: like.site,
          liked: true,
        })),
        nextCursor,
        hasMore,
      };
    }),

  // Check like status for multiple versions (for displaying like state in grid)
  checkLikeStatus: protectedProcedure
    .input(checkLikeStatusSchema)
    .handler(async ({ input, context }) => {
      const { versionIds } = input;
      const userId = context.session.user.id;
      const { db } = context;

      if (versionIds.length === 0) {
        return {};
      }

      const likes = await db
        .select({
          versionId: sitePageVersionLikes.versionId,
        })
        .from(sitePageVersionLikes)
        .where(
          and(
            eq(sitePageVersionLikes.userId, userId),
            inArray(sitePageVersionLikes.versionId, versionIds)
          )
        );

      // Create a map of versionId -> liked status
      const likeMap: Record<string, boolean> = {};
      for (const versionId of versionIds) {
        likeMap[versionId] = likes.some((l) => l.versionId === versionId);
      }

      return likeMap;
    }),
};
