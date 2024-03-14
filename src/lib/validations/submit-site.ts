import { z } from "zod";

export const submitSiteCreateSchema = z.object({
  email: z.string().email(),
  site: z.string().url(),
  title: z.string().optional().or(z.literal("")).default(""),
  description: z.string().optional().or(z.literal("")).default(""),
});
