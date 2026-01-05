import { ORPCError } from "@orpc/server";
import {
  pageIdSchema,
  pageListSchema,
  pageUpsertSchema,
  siteBatchDeleteSchema,
  siteIdSchema,
  siteListSchema,
  siteUpsertSchema,
  versionIdSchema,
  versionListSchema,
  versionUpsertSchema,
} from "@refto-one/common";
import type { DbType } from "@refto-one/db";
import {
  and,
  count,
  eq,
  ilike,
  inArray,
  isNull,
  not,
  or,
  type SQL,
} from "@refto-one/db";
import { user } from "@refto-one/db/schema/auth";
import { sitePages, sitePageVersions, sites } from "@refto-one/db/schema/sites";
import { pageVersionTags, siteTags, tags } from "@refto-one/db/schema/tags";
import { adminProcedure } from "../../index";
import { KVCache, type KVNamespace } from "../../lib/cache";
import { CachePrefix } from "../../lib/cache-keys";
import {
  buildPaginationResult,
  generateId,
  getCountFromResult,
  getPaginationOffset,
  getSortOrder,
  handleDbError,
} from "../../lib/utils";

// Helper to invalidate site-related caches
async function invalidateSiteCaches(kv: KVNamespace | undefined) {
  const cache = new KVCache(kv);
  await Promise.all([
    cache.invalidateVersion(CachePrefix.FEED),
    cache.invalidateVersion(CachePrefix.SITES),
    cache.invalidateVersion(CachePrefix.RELATED),
    cache.invalidateVersion(CachePrefix.TRENDING),
  ]);
}

// Helper to invalidate pinned sites cache
async function invalidatePinnedCaches(kv: KVNamespace | undefined) {
  const cache = new KVCache(kv);
  await cache.invalidateVersion(CachePrefix.PINNED);
}

// Helper to invalidate version-related caches
async function invalidateVersionCaches(kv: KVNamespace | undefined) {
  const cache = new KVCache(kv);
  await Promise.all([
    cache.invalidateVersion(CachePrefix.FEED),
    cache.invalidateVersion(CachePrefix.VERSIONS),
    cache.invalidateVersion(CachePrefix.WEEKLY),
  ]);
}

// Helper to get tags for sites
async function getTagsForSites(db: DbType, siteIds: string[]) {
  if (siteIds.length === 0)
    return new Map<string, (typeof tags.$inferSelect)[]>();

  const siteTagsData = await db
    .select({
      siteId: siteTags.siteId,
      tag: tags,
    })
    .from(siteTags)
    .innerJoin(tags, eq(siteTags.tagId, tags.id))
    .where(and(inArray(siteTags.siteId, siteIds), isNull(tags.deletedAt)));

  const tagMap = new Map<string, (typeof tags.$inferSelect)[]>();
  for (const { siteId, tag } of siteTagsData) {
    if (!tagMap.has(siteId)) {
      tagMap.set(siteId, []);
    }
    tagMap.get(siteId)!.push(tag);
  }
  return tagMap;
}

// Helper to get tags for versions
async function getTagsForVersions(db: DbType, versionIds: string[]) {
  if (versionIds.length === 0)
    return new Map<string, (typeof tags.$inferSelect)[]>();

  const versionTagsData = await db
    .select({
      pageVersionId: pageVersionTags.pageVersionId,
      tag: tags,
    })
    .from(pageVersionTags)
    .innerJoin(tags, eq(pageVersionTags.tagId, tags.id))
    .where(
      and(
        inArray(pageVersionTags.pageVersionId, versionIds),
        isNull(tags.deletedAt)
      )
    );

  const tagMap = new Map<string, (typeof tags.$inferSelect)[]>();
  for (const { pageVersionId, tag } of versionTagsData) {
    if (!tagMap.has(pageVersionId)) {
      tagMap.set(pageVersionId, []);
    }
    tagMap.get(pageVersionId)!.push(tag);
  }
  return tagMap;
}

// Helper to update site tags
async function updateSiteTags(db: DbType, siteId: string, tagIds: string[]) {
  // Delete existing tags
  await db.delete(siteTags).where(eq(siteTags.siteId, siteId));

  // Insert new tags
  if (tagIds.length > 0) {
    await db
      .insert(siteTags)
      .values(tagIds.map((tagId) => ({ siteId, tagId })));
  }
}

// Helper to update version tags
async function updateVersionTags(
  db: DbType,
  versionId: string,
  tagIds: string[]
) {
  // Delete existing tags
  await db
    .delete(pageVersionTags)
    .where(eq(pageVersionTags.pageVersionId, versionId));

  // Insert new tags
  if (tagIds.length > 0) {
    await db
      .insert(pageVersionTags)
      .values(tagIds.map((tagId) => ({ pageVersionId: versionId, tagId })));
  }
}

export const siteRouter = {
  // List sites with pagination, search, filter, sort
  list: adminProcedure
    .input(siteListSchema)
    .handler(async ({ input, context }) => {
      const { page, pageSize, search, isPinned, sortBy, sortOrder } = input;
      const { db } = context;
      const offset = getPaginationOffset({ page, pageSize });

      // Build where conditions
      const conditions: SQL[] = [isNull(sites.deletedAt)];

      if (search) {
        const searchCondition = or(
          ilike(sites.title, `%${search}%`),
          ilike(sites.url, `%${search}%`)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      if (isPinned !== undefined) {
        conditions.push(eq(sites.isPinned, isPinned));
      }

      const whereClause = and(...conditions);

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(sites)
        .where(whereClause);
      const total = getCountFromResult(totalResult);

      // Build order by
      const sortColumn = sortBy === "visits" ? sites.visits : sites.createdAt;

      // Get sites with creator info
      const siteList = await db
        .select({
          id: sites.id,
          title: sites.title,
          slug: sites.slug,
          description: sites.description,
          logo: sites.logo,
          url: sites.url,
          rating: sites.rating,
          isPinned: sites.isPinned,
          visits: sites.visits,
          createdAt: sites.createdAt,
          updatedAt: sites.updatedAt,
          createdById: sites.createdById,
          creatorName: user.name,
          creatorImage: user.image,
        })
        .from(sites)
        .leftJoin(user, eq(sites.createdById, user.id))
        .where(whereClause)
        .orderBy(getSortOrder(sortColumn, sortOrder))
        .limit(pageSize)
        .offset(offset);

      // Get tags for all sites
      const siteIds = siteList.map((s) => s.id);
      const tagsMap = await getTagsForSites(db, siteIds);

      const sitesWithTags = siteList.map((site) => ({
        ...site,
        tags: tagsMap.get(site.id) ?? [],
      }));

      return buildPaginationResult(sitesWithTags, total, { page, pageSize });
    }),

  // Get site by ID with stats
  getById: adminProcedure
    .input(siteIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const site = await db.query.sites.findFirst({
        where: and(eq(sites.id, input.id), isNull(sites.deletedAt)),
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          pages: {
            columns: {
              id: true,
              title: true,
              url: true,
              isDefault: true,
            },
          },
        },
      });

      if (!site) {
        throw new ORPCError("NOT_FOUND", { message: "Site not found" });
      }

      // Get tags for this site
      const tagsMap = await getTagsForSites(db, [site.id]);
      const siteTagsList = tagsMap.get(site.id) ?? [];

      // Get versions count per page in a single query (avoid N+1)
      const pageIds = site.pages.map((p) => p.id);
      const versionCounts =
        pageIds.length > 0
          ? await db
              .select({
                pageId: sitePageVersions.pageId,
                count: count(),
              })
              .from(sitePageVersions)
              .where(inArray(sitePageVersions.pageId, pageIds))
              .groupBy(sitePageVersions.pageId)
          : [];

      const versionCountMap = new Map(
        versionCounts.map((v) => [v.pageId, v.count])
      );

      const pagesWithVersionsCount = site.pages.map((page) => ({
        ...page,
        versionsCount: versionCountMap.get(page.id) ?? 0,
      }));

      // Sort pages: default first
      const sortedPages = pagesWithVersionsCount.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });

      // Get total counts
      const pagesCount = site.pages.length;
      const versionsCount = sortedPages.reduce(
        (sum, page) => sum + page.versionsCount,
        0
      );

      // Find default page
      const defaultPage = sortedPages.find((p) => p.isDefault) ?? null;

      return {
        ...site,
        tags: siteTagsList,
        tagIds: siteTagsList.map((t) => t.id),
        pages: sortedPages,
        pagesCount,
        versionsCount,
        defaultPage,
      };
    }),

  // Get site stats (for list expansion)
  getStats: adminProcedure
    .input(siteIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      // Get pages with their version counts
      const pages = await db
        .select({
          id: sitePages.id,
          title: sitePages.title,
          url: sitePages.url,
          isDefault: sitePages.isDefault,
        })
        .from(sitePages)
        .where(eq(sitePages.siteId, input.id))
        .orderBy(sitePages.isDefault);

      // Get version counts in a single query (avoid N+1)
      const pageIds = pages.map((p) => p.id);
      const versionCounts =
        pageIds.length > 0
          ? await db
              .select({
                pageId: sitePageVersions.pageId,
                count: count(),
              })
              .from(sitePageVersions)
              .where(inArray(sitePageVersions.pageId, pageIds))
              .groupBy(sitePageVersions.pageId)
          : [];

      const versionCountMap = new Map(
        versionCounts.map((v) => [v.pageId, v.count])
      );

      const pagesWithStats = pages.map((page) => ({
        ...page,
        versionsCount: versionCountMap.get(page.id) ?? 0,
      }));

      // Sort pages: default first
      const sortedPages = pagesWithStats.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });

      // Calculate totals
      const pagesCount = pages.length;
      const versionsCount = pagesWithStats.reduce(
        (sum, p) => sum + p.versionsCount,
        0
      );

      return {
        pagesCount,
        versionsCount,
        pages: sortedPages,
      };
    }),

  // Upsert site (create if no id, update if id provided)
  upsert: adminProcedure
    .input(siteUpsertSchema)
    .handler(async ({ input, context }) => {
      const { id, slug, tagIds, ...data } = input;
      const { db } = context;

      try {
        // Check slug uniqueness among non-deleted sites
        const slugConditions = [eq(sites.slug, slug), isNull(sites.deletedAt)];
        if (id) {
          slugConditions.push(not(eq(sites.id, id)));
        }

        const existingSlug = await db.query.sites.findFirst({
          where: and(...slugConditions),
        });

        if (existingSlug) {
          throw new ORPCError("CONFLICT", {
            message: "Site slug already exists",
          });
        }

        if (id) {
          // UPDATE: Check exists, validate URL uniqueness if changed, update
          const existing = await db.query.sites.findFirst({
            where: and(eq(sites.id, id), isNull(sites.deletedAt)),
          });

          if (!existing) {
            throw new ORPCError("NOT_FOUND", { message: "Site not found" });
          }

          const [updated] = await db
            .update(sites)
            .set({
              ...data,
              slug,
              updatedAt: new Date(),
            })
            .where(eq(sites.id, id))
            .returning();

          // Update site tags
          await updateSiteTags(db, id, tagIds);

          // Invalidate caches
          await invalidateSiteCaches(context.kv);
          if (existing.isPinned || data.isPinned) {
            await invalidatePinnedCaches(context.kv);
          }

          return { ...updated, tagIds };
        }
        // CREATE: Generate ID, insert
        const siteId = generateId();

        const [newSite] = await db
          .insert(sites)
          .values({
            id: siteId,
            slug,
            ...data,
            createdById: context.session.user.id,
          })
          .returning();

        // Add site tags
        await updateSiteTags(db, siteId, tagIds);

        // Invalidate caches
        await invalidateSiteCaches(context.kv);

        return { ...newSite, tagIds };
      } catch (error) {
        return handleDbError(error);
      }
    }),

  // Soft delete site
  delete: adminProcedure
    .input(siteIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const existing = await db.query.sites.findFirst({
        where: and(eq(sites.id, input.id), isNull(sites.deletedAt)),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Site not found" });
      }

      const [updated] = await db
        .update(sites)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(sites.id, input.id))
        .returning();

      // Invalidate caches
      await invalidateSiteCaches(context.kv);
      if (existing.isPinned) {
        await invalidatePinnedCaches(context.kv);
      }

      return updated;
    }),

  // Batch soft delete sites
  batchDelete: adminProcedure
    .input(siteBatchDeleteSchema)
    .handler(async ({ input, context }) => {
      const { ids } = input;
      const { db } = context;

      await db
        .update(sites)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(inArray(sites.id, ids), isNull(sites.deletedAt)));

      // Invalidate caches
      await invalidateSiteCaches(context.kv);
      await invalidatePinnedCaches(context.kv);

      return { success: true, deletedCount: ids.length };
    }),

  // Pin site
  pin: adminProcedure
    .input(siteIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const existing = await db.query.sites.findFirst({
        where: and(eq(sites.id, input.id), isNull(sites.deletedAt)),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Site not found" });
      }

      const [updated] = await db
        .update(sites)
        .set({
          isPinned: true,
          updatedAt: new Date(),
        })
        .where(eq(sites.id, input.id))
        .returning();

      // Invalidate pinned cache
      await invalidatePinnedCaches(context.kv);

      return updated;
    }),

  // Unpin site
  unpin: adminProcedure
    .input(siteIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const existing = await db.query.sites.findFirst({
        where: and(eq(sites.id, input.id), isNull(sites.deletedAt)),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Site not found" });
      }

      const [updated] = await db
        .update(sites)
        .set({
          isPinned: false,
          updatedAt: new Date(),
        })
        .where(eq(sites.id, input.id))
        .returning();

      // Invalidate pinned cache
      await invalidatePinnedCaches(context.kv);

      return updated;
    }),

  // Get site with full detail (pages and versions)
  getFullDetail: adminProcedure
    .input(siteIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const site = await db.query.sites.findFirst({
        where: and(eq(sites.id, input.id), isNull(sites.deletedAt)),
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          pages: {
            with: {
              versions: {
                orderBy: (versions, { desc }) => [desc(versions.versionDate)],
              },
            },
            orderBy: (pages, { asc }) => [asc(pages.createdAt)],
          },
        },
      });

      if (!site) {
        throw new ORPCError("NOT_FOUND", { message: "Site not found" });
      }

      // Get tags for this site
      const siteTagsMap = await getTagsForSites(db, [site.id]);

      // Get all version IDs
      const versionIds = site.pages.flatMap((p) => p.versions.map((v) => v.id));
      const versionTagsMap = await getTagsForVersions(db, versionIds);

      // Add tags to pages and versions
      const pagesWithTags = site.pages.map((page) => ({
        ...page,
        versions: page.versions.map((version) => ({
          ...version,
          tags: versionTagsMap.get(version.id) ?? [],
        })),
      }));

      return {
        ...site,
        tags: siteTagsMap.get(site.id) ?? [],
        pages: pagesWithTags,
      };
    }),
};

// ============ Page Router ============
export const pageRouter = {
  // List pages for a site (without versions - use version.list for versions)
  list: adminProcedure
    .input(pageListSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const pages = await db.query.sitePages.findMany({
        where: eq(sitePages.siteId, input.siteId),
        orderBy: (pages, { asc }) => [asc(pages.createdAt)],
      });

      return pages;
    }),

  // Upsert page (create if no id, update if id provided)
  upsert: adminProcedure
    .input(pageUpsertSchema)
    .handler(async ({ input, context }) => {
      const { id, siteId, slug, ...data } = input;
      const { db } = context;

      if (id) {
        // UPDATE
        const existing = await db.query.sitePages.findFirst({
          where: eq(sitePages.id, id),
        });

        if (!existing) {
          throw new ORPCError("NOT_FOUND", { message: "Page not found" });
        }

        // Check URL uniqueness if URL is being updated
        if (data.url !== existing.url) {
          const urlExists = await db.query.sitePages.findFirst({
            where: and(
              eq(sitePages.siteId, existing.siteId),
              eq(sitePages.url, data.url)
            ),
          });

          if (urlExists) {
            throw new ORPCError("CONFLICT", {
              message: "Page URL already exists for this site",
            });
          }
        }

        // Check slug uniqueness within site if slug is being updated
        if (slug !== existing.slug) {
          const slugExists = await db.query.sitePages.findFirst({
            where: and(
              eq(sitePages.siteId, existing.siteId),
              eq(sitePages.slug, slug)
            ),
          });

          if (slugExists) {
            throw new ORPCError("CONFLICT", {
              message: "Page slug already exists for this site",
            });
          }
        }

        // If setting as default, unset other defaults
        if (data.isDefault === true) {
          await db
            .update(sitePages)
            .set({ isDefault: false, updatedAt: new Date() })
            .where(eq(sitePages.siteId, existing.siteId));
        }

        const [updated] = await db
          .update(sitePages)
          .set({
            ...data,
            slug,
            updatedAt: new Date(),
          })
          .where(eq(sitePages.id, id))
          .returning();

        // Invalidate caches
        await invalidateSiteCaches(context.kv);

        return updated;
      }

      // CREATE
      // Check if site exists
      const site = await db.query.sites.findFirst({
        where: and(eq(sites.id, siteId), isNull(sites.deletedAt)),
      });

      if (!site) {
        throw new ORPCError("NOT_FOUND", { message: "Site not found" });
      }

      // Check if URL already exists for this site
      const existingUrl = await db.query.sitePages.findFirst({
        where: and(eq(sitePages.siteId, siteId), eq(sitePages.url, data.url)),
      });

      if (existingUrl) {
        throw new ORPCError("CONFLICT", {
          message: "Page URL already exists for this site",
        });
      }

      // Check if slug already exists for this site
      const existingSlug = await db.query.sitePages.findFirst({
        where: and(eq(sitePages.siteId, siteId), eq(sitePages.slug, slug)),
      });

      if (existingSlug) {
        throw new ORPCError("CONFLICT", {
          message: "Page slug already exists for this site",
        });
      }

      // If this is the first page or isDefault is true, handle default page logic
      const existingPages = await db.query.sitePages.findMany({
        where: eq(sitePages.siteId, siteId),
      });

      const shouldBeDefault = existingPages.length === 0 || data.isDefault;

      // If setting as default, unset other defaults
      if (shouldBeDefault && existingPages.length > 0) {
        await db
          .update(sitePages)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(sitePages.siteId, siteId));
      }

      const pageId = generateId();

      const [newPage] = await db
        .insert(sitePages)
        .values({
          id: pageId,
          siteId,
          title: data.title,
          slug,
          url: data.url,
          isDefault: shouldBeDefault,
        })
        .returning();

      // Invalidate caches
      await invalidateSiteCaches(context.kv);

      return newPage;
    }),

  // Delete page (cascades to versions)
  delete: adminProcedure
    .input(pageIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const existing = await db.query.sitePages.findFirst({
        where: eq(sitePages.id, input.id),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Page not found" });
      }

      // Physical delete (cascade will handle versions)
      await db.delete(sitePages).where(eq(sitePages.id, input.id));

      // Invalidate caches
      await invalidateSiteCaches(context.kv);
      await invalidateVersionCaches(context.kv);

      return { success: true };
    }),
};

// ============ Version Router ============
export const versionRouter = {
  // List versions for a page
  list: adminProcedure
    .input(versionListSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const versions = await db.query.sitePageVersions.findMany({
        where: eq(sitePageVersions.pageId, input.pageId),
        orderBy: (versions, { desc }) => [desc(versions.versionDate)],
      });

      // Get tags for all versions
      const versionIds = versions.map((v) => v.id);
      const tagsMap = await getTagsForVersions(db, versionIds);

      const versionsWithTags = versions.map((version) => {
        const versionTags = tagsMap.get(version.id) ?? [];
        return {
          ...version,
          tags: versionTags,
          tagIds: versionTags.map((t) => t.id),
        };
      });

      return versionsWithTags;
    }),

  // Upsert version (create if no id, update if id provided)
  upsert: adminProcedure
    .input(versionUpsertSchema)
    .handler(async ({ input, context }) => {
      const { id, pageId, tagIds, ...data } = input;
      const { db } = context;

      if (id) {
        // UPDATE
        const existing = await db.query.sitePageVersions.findFirst({
          where: eq(sitePageVersions.id, id),
        });

        if (!existing) {
          throw new ORPCError("NOT_FOUND", { message: "Version not found" });
        }

        const [updated] = await db
          .update(sitePageVersions)
          .set(data)
          .where(eq(sitePageVersions.id, id))
          .returning();

        // Update version tags
        await updateVersionTags(db, id, tagIds);

        // Invalidate caches
        await invalidateVersionCaches(context.kv);

        return updated;
      }

      // CREATE
      // Check if page exists
      const page = await db.query.sitePages.findFirst({
        where: eq(sitePages.id, pageId),
      });

      if (!page) {
        throw new ORPCError("NOT_FOUND", { message: "Page not found" });
      }

      const versionId = generateId();

      const [newVersion] = await db
        .insert(sitePageVersions)
        .values({
          id: versionId,
          pageId,
          versionDate: data.versionDate ?? new Date(),
          versionNote: data.versionNote,
          siteOG: data.siteOG,
          webCover: data.webCover ?? "",
          webRecord: data.webRecord,
          mobileCover: data.mobileCover,
          mobileRecord: data.mobileRecord,
        })
        .returning();

      // Add version tags
      await updateVersionTags(db, versionId, tagIds);

      // Invalidate caches
      await invalidateVersionCaches(context.kv);

      return newVersion;
    }),

  // Delete version
  delete: adminProcedure
    .input(versionIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const existing = await db.query.sitePageVersions.findFirst({
        where: eq(sitePageVersions.id, input.id),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Version not found" });
      }

      // Physical delete
      await db
        .delete(sitePageVersions)
        .where(eq(sitePageVersions.id, input.id));

      // Invalidate caches
      await invalidateVersionCaches(context.kv);

      return { success: true };
    }),
};
