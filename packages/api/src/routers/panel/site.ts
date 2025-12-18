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

    // Get pages count
    const pagesCountResult = await db
      .select({ count: count() })
      .from(sitePages)
      .where(eq(sitePages.siteId, input.id));
    const pagesCount = getCountFromResult(pagesCountResult);

    // Get versions count
    const versionsCountResult = await db
      .select({ count: count() })
      .from(sitePageVersions)
      .innerJoin(sitePages, eq(sitePageVersions.pageId, sitePages.id))
      .where(eq(sitePages.siteId, input.id));
    const versionsCount = getCountFromResult(versionsCountResult);

    // Find default page
    const defaultPage = site.pages.find((p) => p.isDefault) ?? null;

    return {
      ...site,
      pagesCount,
      versionsCount,
      defaultPage,
    };
  }),

  // Upsert site (create if no id, update if id provided)
  upsert: adminProcedure
    .input(siteUpsertSchema)
    .handler(async ({ input, context }) => {
      const { id, ...data } = input;

      if (id) {
        // UPDATE: Check exists, validate URL uniqueness if changed, update
        const existing = await db.query.sites.findFirst({
          where: and(eq(sites.id, id), isNull(sites.deletedAt)),
        });

        if (!existing) {
          throw new ORPCError("NOT_FOUND", { message: "Site not found" });
        }

        // Check URL uniqueness if URL is being updated
        if (data.url !== existing.url) {
          const urlExists = await db.query.sites.findFirst({
            where: and(eq(sites.url, data.url), isNull(sites.deletedAt)),
          });

          if (urlExists) {
            throw new ORPCError("CONFLICT", {
              message: "Site URL already exists",
            });
          }
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
      // CREATE: Validate URL uniqueness, generate ID, insert
      const urlExists = await db.query.sites.findFirst({
        where: and(eq(sites.url, data.url), isNull(sites.deletedAt)),
      });

      if (urlExists) {
        throw new ORPCError("CONFLICT", { message: "Site URL already exists" });
      }

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
