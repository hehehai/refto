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
import { db } from "@refto-one/db";
import { user } from "@refto-one/db/schema/auth";
import { sitePages, sitePageVersions, sites } from "@refto-one/db/schema/sites";
import {
  and,
  count,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  type SQL,
} from "drizzle-orm";
import { adminProcedure } from "../../index";
import {
  buildPaginationResult,
  generateId,
  getCountFromResult,
  getPaginationOffset,
  getSortOrder,
  handleDbError,
} from "../../lib/utils";

export const siteRouter = {
  // List sites with pagination, search, filter, sort
  list: adminProcedure.input(siteListSchema).handler(async ({ input }) => {
    const { page, pageSize, search, isPinned, sortBy, sortOrder } = input;
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
        description: sites.description,
        logo: sites.logo,
        url: sites.url,
        tags: sites.tags,
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

    return buildPaginationResult(siteList, total, { page, pageSize });
  }),

  // Get site by ID with stats
  getById: adminProcedure.input(siteIdSchema).handler(async ({ input }) => {
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
      pages: sortedPages,
      pagesCount,
      versionsCount,
      defaultPage,
    };
  }),

  // Get site stats (for list expansion)
  getStats: adminProcedure.input(siteIdSchema).handler(async ({ input }) => {
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
      const { id, ...data } = input;

      try {
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
              updatedAt: new Date(),
            })
            .where(eq(sites.id, id))
            .returning();

          return updated;
        }
        // CREATE: Generate ID, insert
        const siteId = generateId();

        const [newSite] = await db
          .insert(sites)
          .values({
            id: siteId,
            ...data,
            createdById: context.session.user.id,
          })
          .returning();

        return newSite;
      } catch (error) {
        return handleDbError(error);
      }
    }),

  // Soft delete site
  delete: adminProcedure.input(siteIdSchema).handler(async ({ input }) => {
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

    return updated;
  }),

  // Batch soft delete sites
  batchDelete: adminProcedure
    .input(siteBatchDeleteSchema)
    .handler(async ({ input }) => {
      const { ids } = input;

      await db
        .update(sites)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(inArray(sites.id, ids), isNull(sites.deletedAt)));

      return { success: true, deletedCount: ids.length };
    }),

  // Pin site
  pin: adminProcedure.input(siteIdSchema).handler(async ({ input }) => {
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

    return updated;
  }),

  // Unpin site
  unpin: adminProcedure.input(siteIdSchema).handler(async ({ input }) => {
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

    return updated;
  }),

  // Get site with full detail (pages and versions)
  getFullDetail: adminProcedure
    .input(siteIdSchema)
    .handler(async ({ input }) => {
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

      return site;
    }),
};

// ============ Page Router ============
export const pageRouter = {
  // List pages for a site (without versions - use version.list for versions)
  list: adminProcedure.input(pageListSchema).handler(async ({ input }) => {
    const pages = await db.query.sitePages.findMany({
      where: eq(sitePages.siteId, input.siteId),
      orderBy: (pages, { asc }) => [asc(pages.createdAt)],
    });

    return pages;
  }),

  // Upsert page (create if no id, update if id provided)
  upsert: adminProcedure.input(pageUpsertSchema).handler(async ({ input }) => {
    const { id, siteId, ...data } = input;

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
          updatedAt: new Date(),
        })
        .where(eq(sitePages.id, id))
        .returning();

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
    const existing = await db.query.sitePages.findFirst({
      where: and(eq(sitePages.siteId, siteId), eq(sitePages.url, data.url)),
    });

    if (existing) {
      throw new ORPCError("CONFLICT", {
        message: "Page URL already exists for this site",
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
        url: data.url,
        isDefault: shouldBeDefault,
      })
      .returning();

    return newPage;
  }),

  // Delete page (cascades to versions)
  delete: adminProcedure.input(pageIdSchema).handler(async ({ input }) => {
    const existing = await db.query.sitePages.findFirst({
      where: eq(sitePages.id, input.id),
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "Page not found" });
    }

    // Physical delete (cascade will handle versions)
    await db.delete(sitePages).where(eq(sitePages.id, input.id));

    return { success: true };
  }),
};

// ============ Version Router ============
export const versionRouter = {
  // List versions for a page
  list: adminProcedure.input(versionListSchema).handler(async ({ input }) => {
    const versions = await db.query.sitePageVersions.findMany({
      where: eq(sitePageVersions.pageId, input.pageId),
      orderBy: (versions, { desc }) => [desc(versions.versionDate)],
    });

    return versions;
  }),

  // Upsert version (create if no id, update if id provided)
  upsert: adminProcedure
    .input(versionUpsertSchema)
    .handler(async ({ input }) => {
      const { id, pageId, ...data } = input;

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

      return newVersion;
    }),

  // Delete version
  delete: adminProcedure.input(versionIdSchema).handler(async ({ input }) => {
    const existing = await db.query.sitePageVersions.findFirst({
      where: eq(sitePageVersions.id, input.id),
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "Version not found" });
    }

    // Physical delete
    await db.delete(sitePageVersions).where(eq(sitePageVersions.id, input.id));

    return { success: true };
  }),
};
