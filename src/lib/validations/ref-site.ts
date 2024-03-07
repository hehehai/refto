import { z } from "zod";
import { env } from "@/env";

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
      "Invalid R2 URL, please localization file",
    ),
  siteOGImage: z
    .string()
    .url()
    .startsWith(
      env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL,
      "Invalid R2 URL, please localization file",
    )
    .optional()
    .or(z.literal("")),
  siteCover: z.string().url(),
  siteCoverHeight: z.number(),
  siteCoverWidth: z.number(),
  siteScreenshot: z.string().url().optional().or(z.literal("")),
  siteTags: z.array(z.string()).min(1).max(10),
});

export const updateRefSiteSchema = refSiteSchema.partial().extend({
  id: z.string(),
});
