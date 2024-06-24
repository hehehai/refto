import { env } from '@/env'
import type { RefSite } from '@prisma/client'
import { z } from 'zod'
import { formatOrders, genOrderValidSchema } from '../utils'

export const refSiteSchema = z.object({
  siteName: z.string().trim().min(1).max(255),
  siteTitle: z.string().trim().min(1).max(500),
  siteDescription: z.string().trim().max(1200),
  siteUrl: z.string().url(),
  siteFavicon: z
    .string()
    .url()
    .startsWith(
      env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL,
      'Invalid R2 URL, please localization file',
    ),
  siteOGImage: z
    .string()
    .url()
    .startsWith(
      env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL,
      'Invalid R2 URL, please localization file',
    )
    .optional()
    .or(z.literal('')),
  siteCover: z.string().url(),
  siteCoverHeight: z.number(),
  siteCoverWidth: z.number(),
  siteScreenshot: z.string().url().optional().or(z.literal('')),
  siteRecord: z.string().url().optional().or(z.literal('')),
  siteCoverRecord: z.string().url().optional().or(z.literal('')),
  siteTags: z.array(z.string()).min(1).max(16),
})

export const updateRefSiteSchema = refSiteSchema.partial().extend({
  id: z.string(),
})

export const queryWithCursorRefSiteSchema = z.object({
  search: z.coerce.string().trim().max(1024).optional(),
  limit: z.number().min(1).max(50).optional().default(10),
  cursor: z.string().nullish(),
  orderBy: genOrderValidSchema<RefSite>(['createdAt', 'visits'])
    .optional()
    .default(['-createdAt'])
    .transform((v) => (v?.length ? v : ['-createdAt']))
    .transform(formatOrders),
  tags: z.array(z.string()).max(20).optional().default([]),
  hasTop: z.boolean().default(false).optional(),
})

export type QueryWithCursorRefSite = z.infer<
  typeof queryWithCursorRefSiteSchema
>

export const queryRefSiteSchema = z.object({
  search: z.coerce.string().trim().max(1024).optional(),
  limit: z.number().min(1).max(50).optional().default(10),
  page: z.number().min(0).optional().default(0),
  orderBy: genOrderValidSchema<RefSite>(['createdAt', 'visits'])
    .optional()
    .default(['-createdAt'])
    .transform((v) => (v?.length ? v : ['-createdAt']))
    .transform(formatOrders),
  tags: z.array(z.string()).max(20).optional().default([]),
})

export type QueryRefSite = z.infer<typeof queryRefSiteSchema>
