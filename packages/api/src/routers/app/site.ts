import { ORPCError } from "@orpc/server";
import {
  FeedSort,
  pinnedSitesSchema,
  relatedSitesSchema,
  siteDetailSchema,
  versionDetailSchema,
  versionsFeedSchema,
  weeklyFeedSchema,
} from "@refto-one/common";
import { db } from "@refto-one/db";
import { eventLogs } from "@refto-one/db/schema/events";
import {
  sitePages,
  sitePageVersionLikes,
  sitePageVersions,
  sites,
} from "@refto-one/db/schema/sites";
import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  lt,
  sql,
} from "drizzle-orm";
import { publicProcedure } from "../../index";

export const appSiteRouter = {
  // Get pinned sites with their latest pageVersion
  getPinnedSites: publicProcedure
    .input(pinnedSitesSchema)
    .handler(async ({ input }) => {
      const { limit } = input;

      // Get pinned sites
      const pinnedSites = await db.query.sites.findMany({
        where: and(eq(sites.isPinned, true), isNull(sites.deletedAt)),
        orderBy: [desc(sites.updatedAt)],
        limit,
        with: {
          pages: {
            where: eq(sitePages.isDefault, true),
            limit: 1,
            with: {
              versions: {
                orderBy: [desc(sitePageVersions.createdAt)],
                limit: 1,
              },
            },
          },
        },
      });

      // Transform to include the latest version directly
      return pinnedSites.map((site) => {
        const defaultPage = site.pages[0];
        const latestVersion = defaultPage?.versions[0];
        return {
          id: site.id,
          title: site.title,
          logo: site.logo,
          url: site.url,
          page: defaultPage
            ? {
                id: defaultPage.id,
                url: defaultPage.url,
              }
            : null,
          version: latestVersion
            ? {
                id: latestVersion.id,
                webCover: latestVersion.webCover,
                webRecord: latestVersion.webRecord,
              }
            : null,
        };
      });
    }),

  // Get versions feed for infinite scroll with sorting options
  getVersionsFeed: publicProcedure
    .input(versionsFeedSchema)
    .handler(async ({ input, context }) => {
      const { cursor, limit, sort } = input;
      const userId = context.session?.user?.id;

      // Unauthenticated users are limited to 36 items total
      const maxUnauthItems = 36;
      const effectiveLimit = userId ? limit : Math.min(limit, maxUnauthItems);

      // For trending/popular, we need offset-based pagination
      const offset = cursor ? Number.parseInt(cursor, 10) : 0;

      let items: Array<{
        version: {
          id: string;
          webCover: string;
          webRecord: string | null;
          mobileCover: string | null;
          mobileRecord: string | null;
          createdAt: Date;
        };
        page: {
          id: string;
          title: string;
          url: string;
        };
        site: {
          id: string;
          title: string;
          logo: string;
          url: string;
        };
        likeCount?: number;
      }> = [];
      let hasMore = false;
      let nextCursor: string | null = null;

      if (sort === FeedSort.LATEST) {
        // Latest: cursor-based pagination by createdAt
        const cursorCondition = cursor
          ? lt(sitePageVersions.createdAt, new Date(cursor))
          : undefined;

        const versions = await db
          .select({
            version: {
              id: sitePageVersions.id,
              webCover: sitePageVersions.webCover,
              webRecord: sitePageVersions.webRecord,
              mobileCover: sitePageVersions.mobileCover,
              mobileRecord: sitePageVersions.mobileRecord,
              createdAt: sitePageVersions.createdAt,
            },
            page: {
              id: sitePages.id,
              title: sitePages.title,
              url: sitePages.url,
            },
            site: {
              id: sites.id,
              title: sites.title,
              logo: sites.logo,
              url: sites.url,
            },
          })
          .from(sitePageVersions)
          .innerJoin(sitePages, eq(sitePageVersions.pageId, sitePages.id))
          .innerJoin(sites, eq(sitePages.siteId, sites.id))
          .where(and(isNull(sites.deletedAt), cursorCondition))
          .orderBy(desc(sitePageVersions.createdAt))
          .limit(effectiveLimit + 1);

        hasMore = versions.length > effectiveLimit;
        items = hasMore ? versions.slice(0, effectiveLimit) : versions;
        nextCursor = hasMore
          ? (items.at(-1)?.version.createdAt.toISOString() ?? null)
          : null;
      } else if (sort === FeedSort.TRENDING) {
        // Trending: likes in the last 7 days, offset-based pagination
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Define the subquery once and reference by alias in ORDER BY
        const likeCountExpr = sql<number>`(
          SELECT COUNT(*) FROM site_page_version_likes
          WHERE site_page_version_likes."versionId" = ${sitePageVersions.id}
          AND site_page_version_likes.created_at >= ${sevenDaysAgo}
        )`.as("like_count");

        const versions = await db
          .select({
            version: {
              id: sitePageVersions.id,
              webCover: sitePageVersions.webCover,
              webRecord: sitePageVersions.webRecord,
              mobileCover: sitePageVersions.mobileCover,
              mobileRecord: sitePageVersions.mobileRecord,
              createdAt: sitePageVersions.createdAt,
            },
            page: {
              id: sitePages.id,
              title: sitePages.title,
              url: sitePages.url,
            },
            site: {
              id: sites.id,
              title: sites.title,
              logo: sites.logo,
              url: sites.url,
            },
            likeCount: likeCountExpr,
          })
          .from(sitePageVersions)
          .innerJoin(sitePages, eq(sitePageVersions.pageId, sitePages.id))
          .innerJoin(sites, eq(sitePages.siteId, sites.id))
          .where(isNull(sites.deletedAt))
          .orderBy(desc(sql`like_count`), desc(sitePageVersions.createdAt))
          .limit(effectiveLimit + 1)
          .offset(offset);

        hasMore = versions.length > effectiveLimit;
        items = hasMore ? versions.slice(0, effectiveLimit) : versions;
        nextCursor = hasMore ? String(offset + effectiveLimit) : null;
      } else {
        // Popular: total likes, offset-based pagination
        // Define the subquery once and reference by alias in ORDER BY
        const likeCountExpr = sql<number>`(
          SELECT COUNT(*) FROM site_page_version_likes
          WHERE site_page_version_likes."versionId" = ${sitePageVersions.id}
        )`.as("like_count");

        const versions = await db
          .select({
            version: {
              id: sitePageVersions.id,
              webCover: sitePageVersions.webCover,
              webRecord: sitePageVersions.webRecord,
              mobileCover: sitePageVersions.mobileCover,
              mobileRecord: sitePageVersions.mobileRecord,
              createdAt: sitePageVersions.createdAt,
            },
            page: {
              id: sitePages.id,
              title: sitePages.title,
              url: sitePages.url,
            },
            site: {
              id: sites.id,
              title: sites.title,
              logo: sites.logo,
              url: sites.url,
            },
            likeCount: likeCountExpr,
          })
          .from(sitePageVersions)
          .innerJoin(sitePages, eq(sitePageVersions.pageId, sitePages.id))
          .innerJoin(sites, eq(sitePages.siteId, sites.id))
          .where(isNull(sites.deletedAt))
          .orderBy(desc(sql`like_count`), desc(sitePageVersions.createdAt))
          .limit(effectiveLimit + 1)
          .offset(offset);

        hasMore = versions.length > effectiveLimit;
        items = hasMore ? versions.slice(0, effectiveLimit) : versions;
        nextCursor = hasMore ? String(offset + effectiveLimit) : null;
      }

      // Query like status if user is authenticated
      const likeMap: Record<string, boolean> = {};
      if (userId && items.length > 0) {
        const versionIds = items.map((item) => item.version.id);
        const likes = await db
          .select({ versionId: sitePageVersionLikes.versionId })
          .from(sitePageVersionLikes)
          .where(
            and(
              eq(sitePageVersionLikes.userId, userId),
              inArray(sitePageVersionLikes.versionId, versionIds)
            )
          );

        for (const versionId of versionIds) {
          likeMap[versionId] = likes.some((l) => l.versionId === versionId);
        }
      }

      return {
        items: items.map((item) => ({
          version: item.version,
          page: item.page,
          site: item.site,
          liked: likeMap[item.version.id] ?? false,
        })),
        nextCursor,
        hasMore,
      };
    }),

  // Get version detail with page and site info
  getVersionDetail: publicProcedure
    .input(versionDetailSchema)
    .handler(async ({ input, context }) => {
      const { id } = input;
      const userId = context.session?.user?.id;

      const version = await db.query.sitePageVersions.findFirst({
        where: eq(sitePageVersions.id, id),
        with: {
          page: {
            with: {
              site: {
                with: {
                  pages: {
                    with: {
                      versions: {
                        orderBy: [desc(sitePageVersions.createdAt)],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!version) {
        throw new ORPCError("NOT_FOUND", { message: "Version not found" });
      }

      // Check if site is deleted
      if (version.page.site.deletedAt) {
        throw new ORPCError("NOT_FOUND", { message: "Site not found" });
      }

      // Check if user has liked this version
      let liked = false;
      if (userId) {
        const likeRecord = await db.query.sitePageVersionLikes.findFirst({
          where: and(
            eq(sitePageVersionLikes.versionId, id),
            eq(sitePageVersionLikes.userId, userId)
          ),
        });
        liked = !!likeRecord;
      }

      return {
        ...version,
        liked,
      };
    }),

  // Get site detail with all pages and versions
  getSiteDetail: publicProcedure
    .input(siteDetailSchema)
    .handler(async ({ input }) => {
      const { id } = input;

      const site = await db.query.sites.findFirst({
        where: and(eq(sites.id, id), isNull(sites.deletedAt)),
        with: {
          pages: {
            with: {
              versions: {
                orderBy: [desc(sitePageVersions.createdAt)],
              },
            },
          },
        },
      });

      if (!site) {
        throw new ORPCError("NOT_FOUND", { message: "Site not found" });
      }

      return site;
    }),

  // Get related sites by tag similarity
  getRelatedSites: publicProcedure
    .input(relatedSitesSchema)
    .handler(async ({ input }) => {
      const { siteId, limit } = input;

      // Get the current site's tags
      const currentSite = await db.query.sites.findFirst({
        where: and(eq(sites.id, siteId), isNull(sites.deletedAt)),
        columns: { tags: true },
      });

      if (!currentSite || currentSite.tags.length === 0) {
        return [];
      }

      // Find sites with overlapping tags, ordered by overlap count
      // Convert JS array to PostgreSQL array format
      const tagsArray = sql`ARRAY[${sql.join(
        currentSite.tags.map((tag) => sql`${tag}`),
        sql`, `
      )}]::text[]`;

      const relatedSites = await db
        .select({
          id: sites.id,
          title: sites.title,
          description: sites.description,
          logo: sites.logo,
          url: sites.url,
          tags: sites.tags,
          overlapCount: sql<number>`(
            SELECT COUNT(*) FROM unnest(${sites.tags}) AS t(tag)
            WHERE tag = ANY(${tagsArray})
          )`.as("overlap_count"),
        })
        .from(sites)
        .where(
          and(
            isNull(sites.deletedAt),
            sql`${sites.id} != ${siteId}`,
            sql`${sites.tags} && ${tagsArray}`
          )
        )
        .orderBy(
          desc(
            sql`(
            SELECT COUNT(*) FROM unnest(${sites.tags}) AS t(tag)
            WHERE tag = ANY(${tagsArray})
          )`
          )
        )
        .limit(limit);

      // If no related sites found, return early
      if (relatedSites.length === 0) {
        return [];
      }

      // Get default pages with latest versions for all related sites in one query (avoid N+1)
      const siteIds = relatedSites.map((s) => s.id);

      const pagesWithVersions = await db
        .select({
          siteId: sitePages.siteId,
          pageId: sitePages.id,
          pageTitle: sitePages.title,
          pageUrl: sitePages.url,
          versionId: sitePageVersions.id,
          webCover: sitePageVersions.webCover,
          webRecord: sitePageVersions.webRecord,
          mobileCover: sitePageVersions.mobileCover,
          mobileRecord: sitePageVersions.mobileRecord,
        })
        .from(sitePages)
        .innerJoin(sitePageVersions, eq(sitePageVersions.pageId, sitePages.id))
        .where(
          and(inArray(sitePages.siteId, siteIds), eq(sitePages.isDefault, true))
        )
        .orderBy(desc(sitePageVersions.createdAt));

      // Group by siteId and take the first (latest) version for each
      const siteVersionMap = new Map<
        string,
        {
          page: { id: string; title: string; url: string };
          version: {
            id: string;
            webCover: string;
            webRecord: string | null;
            mobileCover: string | null;
            mobileRecord: string | null;
          };
        }
      >();

      for (const row of pagesWithVersions) {
        if (!siteVersionMap.has(row.siteId)) {
          siteVersionMap.set(row.siteId, {
            page: {
              id: row.pageId,
              title: row.pageTitle,
              url: row.pageUrl,
            },
            version: {
              id: row.versionId,
              webCover: row.webCover,
              webRecord: row.webRecord,
              mobileCover: row.mobileCover,
              mobileRecord: row.mobileRecord,
            },
          });
        }
      }

      // Build final result and filter out sites without versions
      return relatedSites
        .map((site) => {
          const data = siteVersionMap.get(site.id);
          if (!data) return null;

          return {
            id: site.id,
            title: site.title,
            description: site.description,
            logo: site.logo,
            url: site.url,
            tags: site.tags,
            page: data.page,
            version: data.version,
          };
        })
        .filter((site) => site !== null);
    }),

  // Get weekly feed - top liked versions per week for infinite scroll
  getWeeklyFeed: publicProcedure
    .input(weeklyFeedSchema)
    .handler(async ({ input, context }) => {
      const { cursor = 0, limit } = input;
      const userId = context.session?.user?.id;

      // Unauthenticated users limited to 3 weeks
      const maxWeeksUnauth = 3;
      const effectiveLimit = userId
        ? limit
        : Math.min(limit, maxWeeksUnauth - cursor);

      if (effectiveLimit <= 0) {
        return { weeks: [], nextCursor: null, hasMore: false };
      }

      const weeks: Array<{
        weekOffset: number;
        startDate: string;
        endDate: string;
        isCurrent: boolean;
        items: Array<{
          version: {
            id: string;
            webCover: string;
            webRecord: string | null;
            mobileCover: string | null;
            mobileRecord: string | null;
            createdAt: Date;
          };
          page: {
            id: string;
            title: string;
            url: string;
          };
          site: {
            id: string;
            title: string;
            logo: string;
            url: string;
          };
          likeCount: number;
          liked: boolean;
        }>;
      }> = [];

      for (let i = cursor; i < cursor + effectiveLimit; i++) {
        const { start, end } = getWeekRange(i);

        // Query top 6 versions by like count in this week
        const topVersions = await db
          .select({
            versionId: eventLogs.targetId,
            likeCount: count(),
          })
          .from(eventLogs)
          .where(
            and(
              eq(eventLogs.eventType, "VERSION_LIKED"),
              eq(eventLogs.targetType, "version"),
              gte(eventLogs.createdAt, start),
              lt(eventLogs.createdAt, end)
            )
          )
          .groupBy(eventLogs.targetId)
          .orderBy(desc(count()))
          .limit(6);

        // Skip weeks with no data
        if (topVersions.length === 0) {
          continue;
        }

        // Get version details with page and site info
        const versionIds = topVersions
          .map((v) => v.versionId)
          .filter((id): id is string => id !== null);

        const versions = await db.query.sitePageVersions.findMany({
          where: inArray(sitePageVersions.id, versionIds),
          with: {
            page: {
              with: {
                site: true,
              },
            },
          },
        });

        // Build items sorted by like count
        const items = versionIds
          .map((id) => {
            const version = versions.find((v) => v.id === id);
            const stats = topVersions.find((t) => t.versionId === id);
            if (!version || version.page.site.deletedAt) return null;

            return {
              version: {
                id: version.id,
                webCover: version.webCover,
                webRecord: version.webRecord,
                mobileCover: version.mobileCover,
                mobileRecord: version.mobileRecord,
                createdAt: version.createdAt,
              },
              page: {
                id: version.page.id,
                title: version.page.title,
                url: version.page.url,
              },
              site: {
                id: version.page.site.id,
                title: version.page.site.title,
                logo: version.page.site.logo,
                url: version.page.site.url,
              },
              likeCount: stats?.likeCount ?? 0,
              liked: false, // Will be filled below
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        weeks.push({
          weekOffset: i,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          isCurrent: i === 0,
          items,
        });
      }

      // Query user's like status for all versions
      if (userId) {
        const allVersionIds = weeks.flatMap((w) =>
          w.items.map((i) => i.version.id)
        );

        if (allVersionIds.length > 0) {
          const likes = await db
            .select({ versionId: sitePageVersionLikes.versionId })
            .from(sitePageVersionLikes)
            .where(
              and(
                eq(sitePageVersionLikes.userId, userId),
                inArray(sitePageVersionLikes.versionId, allVersionIds)
              )
            );

          const likedSet = new Set(likes.map((l) => l.versionId));

          // Update liked status
          for (const week of weeks) {
            for (const item of week.items) {
              item.liked = likedSet.has(item.version.id);
            }
          }
        }
      }

      const nextCursor = cursor + effectiveLimit;

      // Determine if there's more data:
      // - For unauth users: limit to maxWeeksUnauth
      // - For auth users: if we checked weeks and found at least some data, there might be more
      // - If we checked all requested weeks and got 0 results, no more data
      const hasMore = userId
        ? weeks.length > 0 // Only continue if we found some data
        : nextCursor < maxWeeksUnauth;

      return {
        weeks,
        nextCursor: hasMore ? nextCursor : null,
        hasMore,
      };
    }),
};

// Helper: Get week start (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

// Helper: Get week range for a given offset (0 = current week, 1 = last week, etc.)
function getWeekRange(weeksAgo: number): { start: Date; end: Date } {
  const now = new Date();
  const currentWeekStart = getWeekStart(now);

  const start = new Date(currentWeekStart);
  start.setDate(start.getDate() - weeksAgo * 7);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  // If current week, end is now
  if (weeksAgo === 0) {
    return { start, end: now };
  }

  return { start, end };
}
