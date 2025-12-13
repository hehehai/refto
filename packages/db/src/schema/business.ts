import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Weekly newsletter type
export type WeeklySiteReference = {
  siteId: string;
  pageId: string;
  versionId: string;
};

// Weekly newsletter
export const weekly = pgTable("weekly", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  sites: jsonb("sites").$type<WeeklySiteReference[]>().notNull(),
  weekStart: timestamp("weekStart").notNull(),
  weekEnd: timestamp("weekEnd").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports
export type Weekly = typeof weekly.$inferSelect;
export type NewWeekly = typeof weekly.$inferInsert;
