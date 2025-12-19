import { ORPCError } from "@orpc/server";
import {
  pinnedSitesSchema,
  relatedSitesSchema,
  siteDetailSchema,
  versionDetailSchema,
  versionsFeedSchema,
} from "@refto-one/common";
import { db } from "@refto-one/db";
import { sitePages, sitePageVersions, sites } from "@refto-one/db/schema/sites";
import { and, desc, eq, isNull, lt, sql } from "drizzle-orm";
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
      });
    }),

  // Get versions feed for infinite scroll (ordered by createdAt DESC)
  getVersionsFeed: publicProcedure
    .input(versionsFeedSchema)
    .handler(async ({ input }) => {
      const { cursor, limit } = input;

      // Build cursor condition
      const cursorCondition = cursor
        ? lt(sitePageVersions.createdAt, new Date(cursor))
        : undefined;

      // Get versions with page and site info
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
        .limit(limit + 1); // Fetch one extra to check if there are more

      const hasMore = versions.length > limit;
      const items = hasMore ? versions.slice(0, limit) : versions;
      const nextCursor = hasMore
        ? (items.at(-1)?.version.createdAt.toISOString() ?? null)
        : null;

      return {
        items,
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
      // Using raw SQL for array overlap and counting
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
            WHERE tag = ANY(${currentSite.tags})
          )`.as("overlap_count"),
        })
        .from(sites)
        .where(
          and(
            isNull(sites.deletedAt),
            sql`${sites.id} != ${siteId}`,
            sql`${sites.tags} && ${currentSite.tags}` // Array overlap operator
          )
        )
        .orderBy(
          desc(
            sql`(
            SELECT COUNT(*) FROM unnest(${sites.tags}) AS t(tag)
            WHERE tag = ANY(${currentSite.tags})
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
