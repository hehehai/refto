import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

// Enums
export const submitSiteStatusEnum = pgEnum("SubmitSiteStatus", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const weeklySentStatusEnum = pgEnum("WeeklySentStatus", [
  "AWAITING",
  "PENDING",
  "SENT",
]);

// Better Auth models
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("USER").notNull(),
  // Admin plugin fields
  banned: boolean("banned").default(false),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    idToken: text("idToken"),
    password: text("password"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("account_provider_idx").on(table.providerId, table.accountId),
  ]
);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("verification_identifier_value_idx").on(
      table.identifier,
      table.value
    ),
  ]
);

// Application models
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
});

export const refSite = pgTable(
  "ref_sites",
  {
    id: text("id").primaryKey(),
    siteName: varchar("siteName", { length: 255 }).notNull(),
    siteTitle: varchar("siteTitle", { length: 500 }).notNull(),
    siteDescription: varchar("siteDescription", { length: 1200 }).notNull(),
    siteFavicon: text("siteFavicon").notNull(),
    siteUrl: text("siteUrl").notNull().unique(),
    siteCover: text("siteCover").notNull(),
    siteCoverHeight: doublePrecision("siteCoverHeight").notNull(),
    siteCoverWidth: doublePrecision("siteCoverWidth").notNull(),
    siteScreenshot: text("siteScreenshot").default(""),
    siteRecord: text("siteRecord").default(""),
    siteCoverRecord: text("siteCoverRecord").default(""),
    siteOGImage: text("siteOGImage").default(""),
    siteTags: text("siteTags").array().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    visits: integer("visits").default(0).notNull(),
    isTop: boolean("isTop").default(false).notNull(),
    createdById: text("createdById")
      .notNull()
      .references(() => user.id),
  },
  (table) => [
    index("ref_sites_name_title_url_idx").on(
      table.siteName,
      table.siteTitle,
      table.siteUrl
    ),
  ]
);

export const refSiteLike = pgTable(
  "ref_site_likes",
  {
    id: text("id").primaryKey(),
    refSiteId: text("refSiteId")
      .notNull()
      .references(() => refSite.id),
    userId: text("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("ref_site_likes_site_user_idx").on(
      table.refSiteId,
      table.userId
    ),
  ]
);

export const weekly = pgTable("weekly", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  sites: text("sites").array().notNull(),
  weekStart: timestamp("weekStart").notNull(),
  weekEnd: timestamp("weekEnd").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  status: weeklySentStatusEnum("status").default("AWAITING").notNull(),
  sentDate: timestamp("sentDate"),
});

export const subscriber = pgTable("email_subscriptions", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  locale: text("locale").default("en").notNull(),
  weekly: text("weekly").array().default([]).notNull(),
  unSubSign: text("unSubSign"),
  unSubDate: timestamp("unSubDate"),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  refSites: many(refSite),
  likes: many(refSiteLike),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const refSiteRelations = relations(refSite, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [refSite.createdById],
    references: [user.id],
  }),
  likes: many(refSiteLike),
}));

export const refSiteLikeRelations = relations(refSiteLike, ({ one }) => ({
  refSite: one(refSite, {
    fields: [refSiteLike.refSiteId],
    references: [refSite.id],
  }),
  user: one(user, { fields: [refSiteLike.userId], references: [user.id] }),
}));

// Type exports
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Account = typeof account.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type SubmitSite = typeof submitSite.$inferSelect;
export type NewSubmitSite = typeof submitSite.$inferInsert;
export type RefSite = typeof refSite.$inferSelect;
export type NewRefSite = typeof refSite.$inferInsert;
export type RefSiteLike = typeof refSiteLike.$inferSelect;
export type Weekly = typeof weekly.$inferSelect;
export type NewWeekly = typeof weekly.$inferInsert;
export type Subscriber = typeof subscriber.$inferSelect;
export type NewSubscriber = typeof subscriber.$inferInsert;

// Enum type exports
export type SubmitSiteStatus = (typeof submitSiteStatusEnum.enumValues)[number];
export type WeeklySentStatus = (typeof weeklySentStatusEnum.enumValues)[number];
