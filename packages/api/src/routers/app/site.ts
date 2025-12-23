import { ORPCError } from "@orpc/server";
import {
  FeedSort,
  pinnedSitesSchema,
  relatedSitesSchema,
  siteDetailSchema,
  versionDetailSchema,
  versionsFeedSchema,
} from "@refto-one/common";
import { db } from "@refto-one/db";
import {
  sitePages,
  sitePageVersionLikes,
  sitePageVersions,
  sites,
} from "@refto-one/db/schema/sites";
import { and, desc, eq, inArray, isNull, lt, sql } from "drizzle-orm";
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
            likeCount: sql<number>`(
              SELECT COUNT(*) FROM site_page_version_likes
              WHERE site_page_version_likes."versionId" = ${sitePageVersions.id}
              AND site_page_version_likes.created_at >= ${sevenDaysAgo}
            )`.as("like_count"),
          })
          .from(sitePageVersions)
          .innerJoin(sitePages, eq(sitePageVersions.pageId, sitePages.id))
          .innerJoin(sites, eq(sitePages.siteId, sites.id))
          .where(isNull(sites.deletedAt))
          .orderBy(
            desc(sql`(
              SELECT COUNT(*) FROM site_page_version_likes
              WHERE site_page_version_likes."versionId" = ${sitePageVersions.id}
              AND site_page_version_likes.created_at >= ${sevenDaysAgo}
            )`),
            desc(sitePageVersions.createdAt)
          )
          .limit(effectiveLimit + 1)
          .offset(offset);

        hasMore = versions.length > effectiveLimit;
        items = hasMore ? versions.slice(0, effectiveLimit) : versions;
        nextCursor = hasMore ? String(offset + effectiveLimit) : null;
      } else {
        // Popular: total likes, offset-based pagination
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
            likeCount: sql<number>`(
              SELECT COUNT(*) FROM site_page_version_likes
              WHERE site_page_version_likes."versionId" = ${sitePageVersions.id}
            )`.as("like_count"),
          })
          .from(sitePageVersions)
          .innerJoin(sitePages, eq(sitePageVersions.pageId, sitePages.id))
          .innerJoin(sites, eq(sitePages.siteId, sites.id))
          .where(isNull(sites.deletedAt))
          .orderBy(
            desc(sql`(
              SELECT COUNT(*) FROM site_page_version_likes
              WHERE site_page_version_likes."versionId" = ${sitePageVersions.id}
            )`),
            desc(sitePageVersions.createdAt)
          )
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
    .handler(async ({ input }) => {
      const { id } = input;

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

      return version;
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

      // For each related site, get the latest version from the default page
      const relatedWithVersions = await Promise.all(
        relatedSites.map(async (site) => {
          const defaultPage = await db.query.sitePages.findFirst({
            where: and(
              eq(sitePages.siteId, site.id),
              eq(sitePages.isDefault, true)
            ),
            with: {
              versions: {
                orderBy: [desc(sitePageVersions.createdAt)],
                limit: 1,
              },
            },
          });

          const latestVersion = defaultPage?.versions[0];

          return {
            id: site.id,
            title: site.title,
            description: site.description,
            logo: site.logo,
            url: site.url,
            tags: site.tags,
            page: defaultPage
              ? {
                  id: defaultPage.id,
                  title: defaultPage.title,
                  url: defaultPage.url,
                }
              : null,
            version: latestVersion
              ? {
                  id: latestVersion.id,
                  webCover: latestVersion.webCover,
                  webRecord: latestVersion.webRecord,
                  mobileCover: latestVersion.mobileCover,
                  mobileRecord: latestVersion.mobileRecord,
                }
              : null,
          };
        })
      );

      // Filter out sites without versions
      return relatedWithVersions.filter((site) => site.version !== null);
    }),
};
