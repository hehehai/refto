import { z } from "zod";

// Cursor-based pagination for infinite scroll
const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(12),
});

// Feed sort options
export const FeedSort = {
  LATEST: "latest",
  TRENDING: "trending",
  POPULAR: "popular",
} as const;

export type FeedSortType = (typeof FeedSort)[keyof typeof FeedSort];

// ============ Site Schemas ============

// Get versions feed (infinite scroll)
export const versionsFeedSchema = cursorPaginationSchema.extend({
  sort: z
    .enum([FeedSort.LATEST, FeedSort.TRENDING, FeedSort.POPULAR])
    .default(FeedSort.LATEST),
});

// Get pinned sites
export const pinnedSitesSchema = z.object({
  limit: z.number().min(1).max(10).default(3),
});

// Get version detail
export const versionDetailSchema = z.object({
  id: z.string(),
});

// Get site detail
export const siteDetailSchema = z.object({
  id: z.string(),
});

// Get related sites by tags
export const relatedSitesSchema = z.object({
  siteId: z.string(),
  limit: z.number().min(1).max(10).default(6),
});

// ============ Like Schemas ============

// Toggle like on version
export const toggleLikeSchema = z.object({
  versionId: z.string(),
});

// Get user's liked versions (infinite scroll)
export const userLikesSchema = cursorPaginationSchema;

// Check like status for multiple versions
export const checkLikeStatusSchema = z.object({
  versionIds: z.array(z.string()),
});

// ============ User Profile Schemas ============

// Update user profile
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  image: z.string().url("Invalid image URL").nullable().optional(),
});

// ============ Type Exports ============

export type VersionsFeed = z.infer<typeof versionsFeedSchema>;
export type PinnedSites = z.infer<typeof pinnedSitesSchema>;
export type VersionDetail = z.infer<typeof versionDetailSchema>;
export type SiteDetail = z.infer<typeof siteDetailSchema>;
export type RelatedSites = z.infer<typeof relatedSitesSchema>;
export type ToggleLike = z.infer<typeof toggleLikeSchema>;
export type UserLikes = z.infer<typeof userLikesSchema>;
export type CheckLikeStatus = z.infer<typeof checkLikeStatusSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
