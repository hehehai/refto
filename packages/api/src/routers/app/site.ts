import { ORPCError } from "@orpc/server";
import {
  FeedSort,
  pinnedSitesSchema,
  relatedSitesSchema,
  siteDetailSchema,
  versionBySlugSchema,
  versionDetailSchema,
  versionsFeedSchema,
  weeklyFeedSchema,
} from "@refto-one/common";
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
} from "@refto-one/db";
import { eventLogs } from "@refto-one/db/schema/events";
import {
  sitePages,
  sitePageVersionLikes,
  sitePageVersions,
  sites,
} from "@refto-one/db/schema/sites";
import { siteTags, tags } from "@refto-one/db/schema/tags";
import { format } from "date-fns";
import { publicProcedure } from "../../index";
import { CACHE_TTL, KVCache } from "../../lib/cache";
import { CacheKeys } from "../../lib/cache-keys";

export const appSiteRouter = {
  // Get pinned sites with their latest pageVersion
  getPinnedSites: publicProcedure
    .input(pinnedSitesSchema)
    .handler(async ({ input, context }) => {
      const { limit } = input;
      const { db, kv } = context;
      const cache = new KVCache(kv);
      const cacheKey = CacheKeys.pinnedSites(limit);

      // Define cache type
      type PinnedSitesCache = ReturnType<typeof transformPinnedSites>;

      // Try cache first
      const cached = await cache.get<PinnedSitesCache>(cacheKey);
      if (cached) {
        return cached;
      }

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

      const result = transformPinnedSites(pinnedSites);

      // Cache the result
      await cache.set(cacheKey, result, { ttl: CACHE_TTL.PINNED_SITES });

      return result;
    }),

  // Get versions feed for infinite scroll with sorting options
  getVersionsFeed: publicProcedure
    .input(versionsFeedSchema)
    .handler(async ({ input, context }) => {
      const { cursor, limit, sort, tags: tagValues } = input;
      const userId = context.session?.user?.id;
      const { db, kv } = context;
      const cache = new KVCache(kv);

      // Determine TTL based on sort type
      const ttl =
        sort === FeedSort.LATEST
          ? CACHE_TTL.FEED_LATEST
          : sort === FeedSort.TRENDING
            ? CACHE_TTL.FEED_TRENDING
            : CACHE_TTL.FEED_POPULAR;

      const cacheKey = CacheKeys.versionsFeed(sort, tagValues, cursor, limit);

      // Unauthenticated users are limited to 36 items total
      const maxUnauthItems = 36;
      const effectiveLimit = userId ? limit : Math.min(limit, maxUnauthItems);

      // For trending/popular, we need offset-based pagination
      const offset = cursor ? Number.parseInt(cursor, 10) : 0;

      // Try cache for public data (without liked status)
      type FeedCacheData = {
        items: Array<{
          version: {
            id: string;
            webCover: string;
            webRecord: string | null;
            mobileCover: string | null;
            mobileRecord: string | null;
            createdAt: string;
            versionDate: string;
          };
          page: {
            id: string;
            title: string;
            slug: string;
            url: string;
          };
          site: {
            id: string;
            title: string;
            slug: string;
            logo: string;
            url: string;
          };
          likeCount?: number;
        }>;
        nextCursor: string | null;
        hasMore: boolean;
      };

      let feedData = await cache.get<FeedCacheData>(cacheKey);

      if (!feedData) {
        // If tags are provided, get site IDs that have these tags
        let tagFilteredSiteIds: string[] | undefined;
        if (tagValues && tagValues.length > 0) {
          const matchingSites = await db
            .select({ siteId: siteTags.siteId })
            .from(siteTags)
            .innerJoin(tags, eq(siteTags.tagId, tags.id))
            .where(and(inArray(tags.value, tagValues), isNull(tags.deletedAt)));
          tagFilteredSiteIds = matchingSites.map((s) => s.siteId);

          // If no sites match the tags, return empty result
          if (tagFilteredSiteIds.length === 0) {
            return { items: [], nextCursor: null, hasMore: false };
          }
        }

        // Build tag filter condition
        const tagFilterCondition = tagFilteredSiteIds
          ? inArray(sites.id, tagFilteredSiteIds)
          : undefined;

        let items: Array<{
          version: {
            id: string;
            webCover: string;
            webRecord: string | null;
            mobileCover: string | null;
            mobileRecord: string | null;
            createdAt: Date;
            versionDate: Date;
          };
          page: {
            id: string;
            title: string;
            slug: string;
            url: string;
          };
          site: {
            id: string;
            title: string;
            slug: string;
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
                versionDate: sitePageVersions.versionDate,
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
            .from(sitePageVersions)
            .innerJoin(sitePages, eq(sitePageVersions.pageId, sitePages.id))
            .innerJoin(sites, eq(sitePages.siteId, sites.id))
            .where(
              and(isNull(sites.deletedAt), cursorCondition, tagFilterCondition)
            )
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
          const sevenDaysAgoISO = sevenDaysAgo.toISOString();

          // Define the subquery once and reference by alias in ORDER BY
          const likeCountExpr = sql<number>`(
            SELECT COUNT(*) FROM site_page_version_likes
            WHERE site_page_version_likes."versionId" = ${sitePageVersions.id}
            AND site_page_version_likes.created_at >= ${sevenDaysAgoISO}
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
                versionDate: sitePageVersions.versionDate,
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
              likeCount: likeCountExpr,
            })
            .from(sitePageVersions)
            .innerJoin(sitePages, eq(sitePageVersions.pageId, sitePages.id))
            .innerJoin(sites, eq(sitePages.siteId, sites.id))
            .where(and(isNull(sites.deletedAt), tagFilterCondition))
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
                versionDate: sitePageVersions.versionDate,
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
              likeCount: likeCountExpr,
            })
            .from(sitePageVersions)
            .innerJoin(sitePages, eq(sitePageVersions.pageId, sitePages.id))
            .innerJoin(sites, eq(sitePages.siteId, sites.id))
            .where(and(isNull(sites.deletedAt), tagFilterCondition))
            .orderBy(desc(sql`like_count`), desc(sitePageVersions.createdAt))
            .limit(effectiveLimit + 1)
            .offset(offset);

          hasMore = versions.length > effectiveLimit;
          items = hasMore ? versions.slice(0, effectiveLimit) : versions;
          nextCursor = hasMore ? String(offset + effectiveLimit) : null;
        }

        // Serialize dates for caching
        feedData = {
          items: items.map((item) => ({
            ...item,
            version: {
              ...item.version,
              createdAt: item.version.createdAt.toISOString(),
              versionDate: item.version.versionDate.toISOString(),
            },
          })),
          nextCursor,
          hasMore,
        };

        // Cache the public data
        await cache.set(cacheKey, feedData, { ttl });
      }

      // Helper to deserialize dates from cache
      const deserializeItem = (item: FeedCacheData["items"][number]) => ({
        ...item,
        version: {
          ...item.version,
          createdAt: new Date(item.version.createdAt),
          versionDate: new Date(item.version.versionDate),
        },
      });

      // Add user-specific liked status
      if (userId && feedData.items.length > 0) {
        const versionIds = feedData.items.map((item) => item.version.id);
        const likes = await db
          .select({ versionId: sitePageVersionLikes.versionId })
          .from(sitePageVersionLikes)
          .where(
            and(
              eq(sitePageVersionLikes.userId, userId),
              inArray(sitePageVersionLikes.versionId, versionIds)
            )
          );

        const likeSet = new Set(likes.map((l) => l.versionId));

        return {
          ...feedData,
          items: feedData.items.map((item) => ({
            ...deserializeItem(item),
            liked: likeSet.has(item.version.id),
          })),
        };
      }

      // Return with liked: false for unauthenticated users
      return {
        ...feedData,
        items: feedData.items.map((item) => ({
          ...deserializeItem(item),
          liked: false,
        })),
      };
    }),

  // Get version detail with page and site info
  // Note: Not cached due to complex nested relations - consider adding cache if needed
  getVersionDetail: publicProcedure
    .input(versionDetailSchema)
    .handler(async ({ input, context }) => {
      const { id } = input;
      const userId = context.session?.user?.id;
      const { db } = context;

      const version = await db.query.sitePageVersions.findFirst({
        where: eq(sitePageVersions.id, id),
        with: {
          page: {
            with: {
              site: {
                with: {
                  pages: {
                    limit: 20,
                    with: {
                      versions: {
                        limit: 5,
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
  // Note: Not cached due to complex nested relations - consider adding cache if needed
  getSiteDetail: publicProcedure
    .input(siteDetailSchema)
    .handler(async ({ input, context }) => {
      const { id } = input;
      const { db } = context;

      const site = await db.query.sites.findFirst({
        where: and(eq(sites.id, id), isNull(sites.deletedAt)),
        with: {
          pages: {
            limit: 20,
            with: {
              versions: {
                limit: 5,
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

  // Get version by slug-based path (siteSlug/pageSlug/versionSlug)
  // Note: Not cached due to complex nested relations - consider adding cache if needed
  getVersionBySlug: publicProcedure
    .input(versionBySlugSchema)
    .handler(async ({ input, context }) => {
      const { siteSlug, pageSlug, versionSlug } = input;
      const userId = context.session?.user?.id;
      const { db } = context;

      // Find site by slug
      const site = await db.query.sites.findFirst({
        where: and(eq(sites.slug, siteSlug), isNull(sites.deletedAt)),
        with: {
          pages: {
            limit: 20,
            with: {
              versions: {
                limit: 10,
                orderBy: [desc(sitePageVersions.versionDate)],
              },
            },
          },
        },
      });

      if (!site) {
        throw new ORPCError("NOT_FOUND", { message: "Site not found" });
      }

      // Get tags for this site
      const siteTagsData = await db
        .select({ tag: tags })
        .from(siteTags)
        .innerJoin(tags, eq(siteTags.tagId, tags.id))
        .where(and(eq(siteTags.siteId, site.id), isNull(tags.deletedAt)));

      // Sort pages: default first, then by createdAt ascending
      const sortedPages = [...site.pages].sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

      const siteWithTags = {
        ...site,
        pages: sortedPages,
        tags: siteTagsData.map((t) => t.tag),
      };

      // Find page (by slug or default)
      const currentPage = pageSlug
        ? site.pages.find((p) => p.slug === pageSlug)
        : (site.pages.find((p) => p.isDefault) ?? site.pages[0]);

      if (!currentPage) {
        throw new ORPCError("NOT_FOUND", { message: "Page not found" });
      }

      // Find version (by date slug or latest)
      let currentVersion: (typeof currentPage.versions)[number] | undefined;
      if (versionSlug) {
        // Parse YYYY-MM-DD and find matching version
        currentVersion = currentPage.versions.find((v) => {
          const vDateFormatted = format(v.versionDate, "yyyy-MM-dd");
          return vDateFormatted === versionSlug;
        });

        if (!currentVersion) {
          throw new ORPCError("NOT_FOUND", { message: "Version not found" });
        }
      } else {
        currentVersion = currentPage.versions[0];
      }

      // Check liked status
      let liked = false;
      if (userId && currentVersion) {
        const likeRecord = await db.query.sitePageVersionLikes.findFirst({
          where: and(
            eq(sitePageVersionLikes.versionId, currentVersion.id),
            eq(sitePageVersionLikes.userId, userId)
          ),
        });
        liked = !!likeRecord;
      }

      return {
        site: siteWithTags,
        currentPage,
        currentVersion: currentVersion ?? null,
        liked,
      };
    }),

  // Get related sites by tag similarity
  getRelatedSites: publicProcedure
    .input(relatedSitesSchema)
    .handler(async ({ input, context }) => {
      const { siteId, limit } = input;
      const { db, kv } = context;
      const cache = new KVCache(kv);
      const cacheKey = CacheKeys.relatedSites(siteId, limit);

      // Define return type
      type RelatedSitesResult = Array<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        logo: string;
        url: string;
        tags: (typeof tags.$inferSelect)[];
        page: { id: string; title: string; slug: string; url: string };
        version: {
          id: string;
          versionDate: Date;
          webCover: string;
          webRecord: string | null;
          mobileCover: string | null;
          mobileRecord: string | null;
        };
      }>;

      // Try cache first
      const cached = await cache.get<RelatedSitesResult>(cacheKey);
      if (cached) {
        return cached;
      }

      // Get the current site's tag IDs
      const currentSiteTagIds = await db
        .select({ tagId: siteTags.tagId })
        .from(siteTags)
        .innerJoin(tags, eq(siteTags.tagId, tags.id))
        .where(and(eq(siteTags.siteId, siteId), isNull(tags.deletedAt)));

      if (currentSiteTagIds.length === 0) {
        return [];
      }

      const tagIds = currentSiteTagIds.map((t) => t.tagId);

      // Find sites with overlapping tags, ordered by overlap count
      const relatedSitesData = await db
        .select({
          id: sites.id,
          title: sites.title,
          slug: sites.slug,
          description: sites.description,
          logo: sites.logo,
          url: sites.url,
          overlapCount: count(siteTags.tagId),
        })
        .from(sites)
        .innerJoin(siteTags, eq(sites.id, siteTags.siteId))
        .innerJoin(tags, eq(siteTags.tagId, tags.id))
        .where(
          and(
            isNull(sites.deletedAt),
            isNull(tags.deletedAt),
            sql`${sites.id} != ${siteId}`,
            inArray(siteTags.tagId, tagIds)
          )
        )
        .groupBy(sites.id)
        .orderBy(desc(count(siteTags.tagId)))
        .limit(limit);

      // If no related sites found, return early
      if (relatedSitesData.length === 0) {
        return [];
      }

      // Get tags for all related sites
      const siteIds = relatedSitesData.map((s) => s.id);
      const siteTagsData = await db
        .select({
          siteId: siteTags.siteId,
          tag: tags,
        })
        .from(siteTags)
        .innerJoin(tags, eq(siteTags.tagId, tags.id))
        .where(and(inArray(siteTags.siteId, siteIds), isNull(tags.deletedAt)));

      const siteTagsMap = new Map<string, (typeof tags.$inferSelect)[]>();
      for (const { siteId: sid, tag } of siteTagsData) {
        if (!siteTagsMap.has(sid)) {
          siteTagsMap.set(sid, []);
        }
        siteTagsMap.get(sid)!.push(tag);
      }

      // Get default pages with latest versions for all related sites in one query (avoid N+1)
      const pagesWithVersions = await db
        .select({
          siteId: sitePages.siteId,
          pageId: sitePages.id,
          pageTitle: sitePages.title,
          pageSlug: sitePages.slug,
          pageUrl: sitePages.url,
          versionId: sitePageVersions.id,
          versionDate: sitePageVersions.versionDate,
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
          page: { id: string; title: string; slug: string; url: string };
          version: {
            id: string;
            versionDate: Date;
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
              slug: row.pageSlug,
              url: row.pageUrl,
            },
            version: {
              id: row.versionId,
              versionDate: row.versionDate,
              webCover: row.webCover,
              webRecord: row.webRecord,
              mobileCover: row.mobileCover,
              mobileRecord: row.mobileRecord,
            },
          });
        }
      }

      // Build final result and filter out sites without versions
      const result = relatedSitesData
        .map((site) => {
          const data = siteVersionMap.get(site.id);
          if (!data) return null;

          return {
            id: site.id,
            title: site.title,
            slug: site.slug,
            description: site.description,
            logo: site.logo,
            url: site.url,
            tags: siteTagsMap.get(site.id) ?? [],
            page: data.page,
            version: data.version,
          };
        })
        .filter((site): site is NonNullable<typeof site> => site !== null);

      // Cache the result
      await cache.set(cacheKey, result, { ttl: CACHE_TTL.RELATED_SITES });

      return result;
    }),

  // Get weekly feed - top liked versions per week for infinite scroll
  getWeeklyFeed: publicProcedure
    .input(weeklyFeedSchema)
    .handler(async ({ input, context }) => {
      const { cursor = 0, limit } = input;
      const userId = context.session?.user?.id;
      const { db, kv } = context;
      const cache = new KVCache(kv);
      const cacheKey = CacheKeys.weeklyFeed(cursor, limit);

      // Unauthenticated users limited to 3 weeks
      const maxWeeksUnauth = 3;
      const effectiveLimit = userId
        ? limit
        : Math.min(limit, maxWeeksUnauth - cursor);

      if (effectiveLimit <= 0) {
        return { weeks: [], nextCursor: null, hasMore: false };
      }

      // Define cache type
      type WeeklyFeedCache = {
        weeks: Array<{
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
              versionDate: string;
              createdAt: string;
            };
            page: {
              id: string;
              title: string;
              slug: string;
              url: string;
            };
            site: {
              id: string;
              title: string;
              slug: string;
              logo: string;
              url: string;
            };
            likeCount: number;
          }>;
        }>;
        nextCursor: number | null;
        hasMore: boolean;
      };

      let cachedData = await cache.get<WeeklyFeedCache>(cacheKey);

      if (!cachedData) {
        const weeks: WeeklyFeedCache["weeks"] = [];

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
                  createdAt: version.createdAt.toISOString(),
                  versionDate: version.versionDate.toISOString(),
                },
                page: {
                  id: version.page.id,
                  title: version.page.title,
                  slug: version.page.slug,
                  url: version.page.url,
                },
                site: {
                  id: version.page.site.id,
                  title: version.page.site.title,
                  slug: version.page.site.slug,
                  logo: version.page.site.logo,
                  url: version.page.site.url,
                },
                likeCount: stats?.likeCount ?? 0,
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

        const nextCursor = cursor + effectiveLimit;
        const hasMore = userId ? weeks.length > 0 : nextCursor < maxWeeksUnauth;

        cachedData = {
          weeks,
          nextCursor: hasMore ? nextCursor : null,
          hasMore,
        };

        // Cache the result
        await cache.set(cacheKey, cachedData, { ttl: CACHE_TTL.WEEKLY_FEED });
      }

      // Helper to deserialize dates from cached week items
      const deserializeWeekItem = (
        item: WeeklyFeedCache["weeks"][number]["items"][number]
      ) => ({
        ...item,
        version: {
          ...item.version,
          createdAt: new Date(item.version.createdAt),
          versionDate: new Date(item.version.versionDate),
        },
      });

      // Query user's like status for all versions (not cached)
      if (userId) {
        const allVersionIds = cachedData.weeks.flatMap((w) =>
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

          return {
            ...cachedData,
            weeks: cachedData.weeks.map((week) => ({
              ...week,
              items: week.items.map((item) => ({
                ...deserializeWeekItem(item),
                liked: likedSet.has(item.version.id),
              })),
            })),
          };
        }
      }

      // Return with liked: false for unauthenticated users
      return {
        ...cachedData,
        weeks: cachedData.weeks.map((week) => ({
          ...week,
          items: week.items.map((item) => ({
            ...deserializeWeekItem(item),
            liked: false,
          })),
        })),
      };
    }),
};

// Helper: Transform pinned sites to response format
type PinnedSiteInput = {
  id: string;
  title: string;
  slug: string;
  logo: string;
  url: string;
  pages: Array<{
    id: string;
    slug: string;
    url: string;
    versions: Array<{
      id: string;
      webCover: string;
      webRecord: string | null;
      versionDate: Date;
    }>;
  }>;
};

function transformPinnedSites(pinnedSites: PinnedSiteInput[]) {
  return pinnedSites.map((site) => {
    const defaultPage = site.pages[0];
    const latestVersion = defaultPage?.versions[0];
    return {
      id: site.id,
      title: site.title,
      slug: site.slug,
      logo: site.logo,
      url: site.url,
      page: defaultPage
        ? {
            id: defaultPage.id,
            slug: defaultPage.slug,
            url: defaultPage.url,
          }
        : null,
      version: latestVersion
        ? {
            id: latestVersion.id,
            webCover: latestVersion.webCover,
            webRecord: latestVersion.webRecord,
            versionDate: latestVersion.versionDate,
          }
        : null,
    };
  });
}

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
