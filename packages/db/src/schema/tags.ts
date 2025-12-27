import { relations, sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { sitePageVersions, sites } from "./sites";

// Tag type enum
export const tagTypeEnum = pgEnum("tag_type", ["category", "section", "style"]);

// Tags table
export const tags = pgTable(
  "tags",
  {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    value: varchar("value", { length: 100 }).notNull(),
    type: tagTypeEnum("type").notNull(),
    description: text("description"),
    tipMedia: text("tip_media"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("tags_type_idx").on(table.type),
    index("tags_name_idx").on(table.name),
    // Partial unique index: value + type must be unique for non-deleted records
    uniqueIndex("tags_value_type_unique")
      .on(table.value, table.type)
      .where(sql`${table.deletedAt} IS NULL`),
  ]
);

// Site-Tag junction table
export const siteTags = pgTable(
  "site_tags",
  {
    siteId: text("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.siteId, table.tagId] }),
    index("site_tags_site_id_idx").on(table.siteId),
    index("site_tags_tag_id_idx").on(table.tagId),
  ]
);

// PageVersion-Tag junction table
export const pageVersionTags = pgTable(
  "page_version_tags",
  {
    pageVersionId: text("page_version_id")
      .notNull()
      .references(() => sitePageVersions.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.pageVersionId, table.tagId] }),
    index("page_version_tags_version_id_idx").on(table.pageVersionId),
    index("page_version_tags_tag_id_idx").on(table.tagId),
  ]
);

// Relations
export const tagsRelations = relations(tags, ({ many }) => ({
  siteTags: many(siteTags),
  pageVersionTags: many(pageVersionTags),
}));

export const siteTagsRelations = relations(siteTags, ({ one }) => ({
  site: one(sites, {
    fields: [siteTags.siteId],
    references: [sites.id],
  }),
  tag: one(tags, {
    fields: [siteTags.tagId],
    references: [tags.id],
  }),
}));

export const pageVersionTagsRelations = relations(
  pageVersionTags,
  ({ one }) => ({
    pageVersion: one(sitePageVersions, {
      fields: [pageVersionTags.pageVersionId],
      references: [sitePageVersions.id],
    }),
    tag: one(tags, {
      fields: [pageVersionTags.tagId],
      references: [tags.id],
    }),
  })
);

// Type exports
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type TagType = (typeof tagTypeEnum.enumValues)[number];
export type SiteTag = typeof siteTags.$inferSelect;
export type PageVersionTag = typeof pageVersionTags.$inferSelect;
