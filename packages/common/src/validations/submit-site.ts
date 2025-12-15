import { z } from "zod";

export const submitSiteCreateSchema = z.object({
  siteUrl: z.url({ message: "Site URL is invalid" }),
  siteTitle: z.string().min(1, "Title is required").max(200),
  siteDescription: z.string().max(1000).default(""),
});

export const submitSiteUpdateSchema = z.object({
  id: z.number(),
  siteUrl: z.url({ message: "Site URL is invalid" }).optional(),
  siteTitle: z.string().min(1).max(200).optional(),
  siteDescription: z.string().max(1000).optional(),
});

export type SubmitSiteCreate = z.infer<typeof submitSiteCreateSchema>;
export type SubmitSiteUpdate = z.infer<typeof submitSiteUpdateSchema>;
