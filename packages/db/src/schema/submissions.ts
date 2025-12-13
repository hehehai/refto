import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { submitSiteStatusEnum } from "./enums";

// Submit site
export const submitSite = pgTable("submit_sites", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull(),
  siteUrl: text("siteUrl").notNull(),
  siteTitle: text("siteTitle").notNull(),
  siteDescription: text("siteDescription").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  status: submitSiteStatusEnum("status").default("PENDING").notNull(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),
});

// Relations
export const submitSiteRelations = relations(submitSite, ({ one }) => ({
  user: one(user, { fields: [submitSite.userId], references: [user.id] }),
}));

// Type exports
export type SubmitSite = typeof submitSite.$inferSelect;
export type NewSubmitSite = typeof submitSite.$inferInsert;
