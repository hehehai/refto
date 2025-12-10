import { z } from "zod";
import type { Weekly } from "@/lib/db/schema";
import { formatOrders, genOrderValidSchema } from "@/lib/utils";

// Weekly site reference schema
export const weeklySiteReferenceSchema = z.object({
  siteId: z.string(),
  pageId: z.string(),
  versionId: z.string(),
});

export const weeklySchema = z.object({
  title: z.string().trim().min(1).max(255),
  sites: z.array(weeklySiteReferenceSchema).length(5),
  weekRange: z.array(z.date()).length(2),
});

export const updateWeeklySchema = weeklySchema.partial().extend({
  id: z.string(),
});

export const queryWeeklySchema = z.object({
  search: z.coerce.string().trim().max(1024).optional(),
  limit: z.number().min(1).max(50).optional().default(10),
  page: z.number().min(0).optional().default(0),
  orderBy: genOrderValidSchema<Weekly>(["weekStart", "createdAt"])
    .optional()
    .default(["-weekStart"])
    .transform((v) => (v?.length ? v : ["-weekStart"]))
    .transform(formatOrders),
});

export type QueryWeekly = z.infer<typeof queryWeeklySchema>;
