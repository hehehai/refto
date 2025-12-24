import { z } from "zod";

// Pagination base schema
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

// User list query
export const userListSchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  status: z.enum(["normal", "ban"]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// User create
export const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
  image: z.string().url().nullable().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// User update
export const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  image: z.string().url().nullable().optional(),
  password: z.string().min(8).optional(),
});

// User form schema (for client-side validation)
export const userFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email"),
    role: z.enum(["ADMIN", "USER"]),
    image: z.string().url().nullable(),
    password: z.string(),
    mode: z.enum(["create", "edit"]),
  })
  .refine(
    (data) => {
      if (data.mode === "create") {
        return data.password && data.password.length >= 8;
      }
      return (
        !data.password ||
        data.password.length === 0 ||
        data.password.length >= 8
      );
    },
    {
      message: "Password must be at least 8 characters",
      path: ["password"],
    }
  );

export type UserFormData = z.infer<typeof userFormSchema>;

// User ban
export const userBanSchema = z.object({
  id: z.string(),
  reason: z.string().min(1, "Ban reason is required"),
  expiresAt: z.coerce.date().optional(),
});

// User ID schema
export const userIdSchema = z.object({
  id: z.string(),
});

// Batch delete users
export const userBatchDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one user ID is required"),
});

// User list for filter dropdown (lightweight)
export const userListForFilterSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
});

// Submit site list (admin)
export const panelSubmitSiteListSchema = paginationSchema.extend({
  search: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(["ALL", "PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
  sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Submit site delete schema
export const submitSiteDeleteSchema = z.object({
  id: z.number(),
});

// Submit site ID schema
export const submitSiteIdSchema = z.object({
  id: z.number(),
});

// Submit site reject
export const submitSiteRejectSchema = z.object({
  id: z.number(),
  reason: z.string().min(1, "Reject reason is required"),
});

// Stats period
export const statPeriodSchema = z.object({
  period: z.enum(["24h", "7d", "15d", "30d"]).default("24h"),
});

// Like leaderboard range
export const likeLeaderboardRangeEnum = z.enum([
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "this_year",
]);

export const likeLeaderboardSchema = z.object({
  range: likeLeaderboardRangeEnum.default("today"),
  limit: z.number().min(1).max(50).default(10),
});

// Site list query
export const siteListSchema = paginationSchema.extend({
  search: z.string().optional(),
  isPinned: z.boolean().optional(),
  sortBy: z.enum(["createdAt", "visits"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Site create
export const siteCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  logo: z.string().url("Invalid logo URL"),
  url: z.string().url("Invalid URL"),
  tags: z.array(z.string()),
  rating: z.number().min(0).max(5).default(0),
  isPinned: z.boolean().default(false),
});

// Site update
export const siteUpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  logo: z.string().url().optional(),
  url: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  isPinned: z.boolean().optional(),
});

// Site upsert (id optional - no id = create, with id = update)
export const siteUpsertSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  logo: z.string().url("Invalid logo URL"),
  url: z.string().url("Invalid URL"),
  tags: z.array(z.string()),
  rating: z.number().min(0).max(5).default(0),
  isPinned: z.boolean().default(false),
});

// Site ID schema
export const siteIdSchema = z.object({
  id: z.string(),
});

// Batch delete sites
export const siteBatchDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one site ID is required"),
});

// ============ Site Page Schemas ============

// Page ID schema
export const pageIdSchema = z.object({
  id: z.string(),
});

// Page list query
export const pageListSchema = z.object({
  siteId: z.string(),
});

// Page create
export const pageCreateSchema = z.object({
  siteId: z.string(),
  title: z.string().min(1, "Title is required"),
  url: z.string().min(1, "URL is required"),
  isDefault: z.boolean().default(false),
});

// Page update
export const pageUpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
});

// Page upsert (id optional - no id = create, with id = update)
export const pageUpsertSchema = z.object({
  id: z.string().optional(),
  siteId: z.string(),
  title: z.string().min(1, "Title is required"),
  url: z.string().min(1, "URL is required"),
  isDefault: z.boolean().default(false),
});

// ============ Site Page Version Schemas ============

// Version ID schema
export const versionIdSchema = z.object({
  id: z.string(),
});

// Version list query
export const versionListSchema = z.object({
  pageId: z.string(),
});

// Version create
export const versionCreateSchema = z.object({
  pageId: z.string(),
  versionDate: z.coerce.date().optional(),
  versionNote: z.string().optional(),
  siteOG: z.string().optional(),
  webCover: z.string().optional(),
  webRecord: z.string().optional(),
  mobileCover: z.string().optional(),
  mobileRecord: z.string().optional(),
});

// Version update
export const versionUpdateSchema = z.object({
  id: z.string(),
  versionDate: z.coerce.date().optional(),
  versionNote: z.string().optional(),
  siteOG: z.string().nullable().optional(),
  webCover: z.string().min(1).optional(),
  webRecord: z.string().nullable().optional(),
  mobileCover: z.string().nullable().optional(),
  mobileRecord: z.string().nullable().optional(),
});

// Version upsert (id optional - no id = create, with id = update)
export const versionUpsertSchema = z.object({
  id: z.string().optional(),
  pageId: z.string(),
  versionDate: z.coerce.date().optional(),
  versionNote: z.string().optional(),
  siteOG: z.string().nullable().optional(),
  webCover: z.string().optional(),
  webRecord: z.string().nullable().optional(),
  mobileCover: z.string().nullable().optional(),
  mobileRecord: z.string().nullable().optional(),
});

// Type exports
export type UserList = z.infer<typeof userListSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserBan = z.infer<typeof userBanSchema>;
export type UserBatchDelete = z.infer<typeof userBatchDeleteSchema>;
export type UserListForFilter = z.infer<typeof userListForFilterSchema>;
export type PanelSubmitSiteList = z.infer<typeof panelSubmitSiteListSchema>;
export type SubmitSiteReject = z.infer<typeof submitSiteRejectSchema>;
export type SubmitSiteDelete = z.infer<typeof submitSiteDeleteSchema>;
export type StatPeriod = z.infer<typeof statPeriodSchema>;
export type LikeLeaderboardRange = z.infer<typeof likeLeaderboardRangeEnum>;
export type LikeLeaderboard = z.infer<typeof likeLeaderboardSchema>;
export type SiteList = z.infer<typeof siteListSchema>;
export type SiteCreate = z.infer<typeof siteCreateSchema>;
export type SiteUpdate = z.infer<typeof siteUpdateSchema>;
export type SiteUpsert = z.infer<typeof siteUpsertSchema>;
export type SiteBatchDelete = z.infer<typeof siteBatchDeleteSchema>;
export type PageCreate = z.infer<typeof pageCreateSchema>;
export type PageUpdate = z.infer<typeof pageUpdateSchema>;
export type PageUpsert = z.infer<typeof pageUpsertSchema>;
export type PageList = z.infer<typeof pageListSchema>;
export type VersionCreate = z.infer<typeof versionCreateSchema>;
export type VersionUpdate = z.infer<typeof versionUpdateSchema>;
export type VersionUpsert = z.infer<typeof versionUpsertSchema>;
export type VersionList = z.infer<typeof versionListSchema>;
