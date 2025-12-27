import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Sites - Base site information
export const sites = pgTable(
  "sites",
  {
    id: text("id").primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description").notNull(),
    logo: text("logo").notNull(),
    url: text("url").notNull(),
    rating: integer("rating").default(0).notNull(),
    isPinned: boolean("isPinned").default(false).notNull(),
    visits: integer("visits").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    createdById: text("createdById")
      .notNull()
      .references(() => user.id),
  },
  (table) => [
    index("sites_url_idx").on(table.url),
    index("sites_pinned_idx").on(table.isPinned),
    // Partial unique index: only enforce uniqueness for non-deleted records
    uniqueIndex("sites_url_unique")
      .on(table.url)
      .where(sql`${table.deletedAt} IS NULL`),
    // Partial unique index for slug: only enforce uniqueness for non-deleted records
    uniqueIndex("sites_slug_unique")
      .on(table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
  ]
);

// Site Pages - Multiple pages per site
export const sitePages = pgTable(
  "site_pages",
  {
    id: text("id").primaryKey(),
    siteId: text("siteId")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    url: text("url").notNull(),
    isDefault: boolean("isDefault").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("site_pages_site_id_idx").on(table.siteId),
    index("site_pages_default_idx").on(table.siteId, table.isDefault),
    uniqueIndex("site_pages_site_url_idx").on(table.siteId, table.url),
    uniqueIndex("site_pages_site_slug_idx").on(table.siteId, table.slug),
  ]
);

// Site Page Versions - Date-based snapshots with web/mobile support
export const sitePageVersions = pgTable(
  "site_page_versions",
  {
    id: text("id").primaryKey(),
    pageId: text("pageId")
      .notNull()
      .references(() => sitePages.id, { onDelete: "cascade" }),
    versionDate: timestamp("versionDate").defaultNow().notNull(),
    versionNote: text("versionNote"),

    // Common OG image
    siteOG: text("siteOG"),

    // Web mode (required)
    webCover: text("webCover").notNull(),
    webRecord: text("webRecord"),

    // Mobile mode (optional)
    mobileCover: text("mobileCover"),
    mobileRecord: text("mobileRecord"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("site_page_versions_page_id_idx").on(table.pageId),
    index("site_page_versions_date_idx").on(table.pageId, table.versionDate),
  ]
);

// Site Page Version Likes - User likes at version level
export const sitePageVersionLikes = pgTable(
  "site_page_version_likes",
  {
    id: text("id").primaryKey(),
    versionId: text("versionId")
      .notNull()
      .references(() => sitePageVersions.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("site_page_version_likes_version_user_idx").on(
      table.versionId,
      table.userId
    ),
    index("site_page_version_likes_version_idx").on(table.versionId),
  ]
);

// Relations
export const sitesRelations = relations(sites, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [sites.createdById],
    references: [user.id],
  }),
  pages: many(sitePages),
}));

export const sitePagesRelations = relations(sitePages, ({ one, many }) => ({
  site: one(sites, {
    fields: [sitePages.siteId],
    references: [sites.id],
  }),
  versions: many(sitePageVersions),
}));

export const sitePageVersionsRelations = relations(
  sitePageVersions,
  ({ one, many }) => ({
    page: one(sitePages, {
      fields: [sitePageVersions.pageId],
      references: [sitePages.id],
    }),
    likes: many(sitePageVersionLikes),
  })
);

export const sitePageVersionLikesRelations = relations(
  sitePageVersionLikes,
  ({ one }) => ({
    version: one(sitePageVersions, {
      fields: [sitePageVersionLikes.versionId],
      references: [sitePageVersions.id],
    }),
    user: one(user, {
      fields: [sitePageVersionLikes.userId],
      references: [user.id],
    }),
  })
);

// Type exports
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type SitePage = typeof sitePages.$inferSelect;
export type NewSitePage = typeof sitePages.$inferInsert;
export type SitePageVersion = typeof sitePageVersions.$inferSelect;
export type NewSitePageVersion = typeof sitePageVersions.$inferInsert;
export type SitePageVersionLike = typeof sitePageVersionLikes.$inferSelect;
export type NewSitePageVersionLike = typeof sitePageVersionLikes.$inferInsert;
