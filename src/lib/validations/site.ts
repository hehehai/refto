import { z } from "zod";
import { env } from "@/env";
import type { Site } from "@/lib/db/schema";
import { formatOrders, genOrderValidSchema } from "@/lib/utils";

// Site-level validation (matches sites table schema)
export const siteSchema = z.object({
  title: z.string().trim().min(1).max(500),
  description: z.string().trim().max(1200),
  url: z.string().url(),
  logo: z
    .string()
    .url()
    .startsWith(
      env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL,
      "Invalid R2 URL, please localization file"
    ),
  tags: z.array(z.string()).min(1).max(16),
  rating: z.number().min(0).max(5).optional().default(0),
  isPinned: z.boolean().optional().default(false),
});

// Page-level validation (matches site_pages table schema)
export const pageSchema = z.object({
  title: z.string().trim().min(1).max(255),
  url: z.string().url(),
  isDefault: z.boolean().optional().default(true),
});

// Version-level validation (matches site_page_versions table schema)
export const versionSchema = z.object({
  versionDate: z.date().optional(),
  versionNote: z.string().trim().max(500).optional(),

  // Common OG image
  siteOG: z.string().url().optional().or(z.literal("")),

  // Web mode (required)
  webCover: z.string().url(),
  webRecord: z.string().url().optional().or(z.literal("")),

  // Mobile mode (optional)
  mobileCover: z.string().url().optional().or(z.literal("")),
  mobileRecord: z.string().url().optional().or(z.literal("")),
});

// Combined schema for creation (merges all three levels)
export const siteCreateSchema = siteSchema
  .merge(pageSchema)
  .merge(versionSchema);

export const siteUpdateSchema = siteCreateSchema.partial().extend({
  id: z.string(),
});

// Query schemas
export const queryWithCursorSiteSchema = z.object({
  search: z.coerce.string().trim().max(1024).optional(),
  limit: z.number().min(1).max(50).optional().default(10),
  cursor: z.string().nullish(),
  orderBy: genOrderValidSchema<Site>(["createdAt", "visits", "rating"])
    .optional()
    .default(["-createdAt"])
    .transform((v) => (v?.length ? v : ["-createdAt"]))
    .transform(formatOrders),
  tags: z.array(z.string()).max(20).optional().default([]),
  isPinned: z.boolean().optional(),
});

export type QueryWithCursorSite = z.infer<typeof queryWithCursorSiteSchema>;

export const querySiteSchema = z.object({
  search: z.coerce.string().trim().max(1024).optional(),
  limit: z.number().min(1).max(50).optional().default(10),
  page: z.number().min(0).optional().default(0),
  orderBy: genOrderValidSchema<Site>(["createdAt", "visits", "rating"])
    .optional()
    .default(["-createdAt"])
    .transform((v) => (v?.length ? v : ["-createdAt"]))
    .transform(formatOrders),
  tags: z.array(z.string()).max(20).optional().default([]),
  isPinned: z.boolean().optional(),
});

export type QuerySite = z.infer<typeof querySiteSchema>;

// Delete schema
export const deleteSiteSchema = z.object({
  ids: z.array(z.string()).min(1).max(50),
});

// Pin/unpin schema
export const switchPinnedSchema = z.object({
  id: z.string(),
  nextIsPinned: z.boolean(),
});
