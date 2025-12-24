import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { submitSiteStatusEnum } from "./enums";

// Submit site
export const submitSite = pgTable(
  "submit_sites",
  {
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
    rejectReason: text("reject_reason"),
    deletedAt: timestamp("deleted_at"),
    userId: text("userId").references(() => user.id, { onDelete: "set null" }),
  },
  (table) => [
    index("submit_sites_user_id_idx").on(table.userId),
    index("submit_sites_status_idx").on(table.status),
    index("submit_sites_created_at_idx").on(table.createdAt),
    index("submit_sites_status_created_at_idx").on(
      table.status,
      table.createdAt
    ),
  ]
);

// Relations
export const submitSiteRelations = relations(submitSite, ({ one }) => ({
  user: one(user, { fields: [submitSite.userId], references: [user.id] }),
}));

// Type exports
export type SubmitSite = typeof submitSite.$inferSelect;
export type NewSubmitSite = typeof submitSite.$inferInsert;
