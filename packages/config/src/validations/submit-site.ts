import { z } from "zod";

export const submitSiteCreateSchema = z.object({
  site: z.url({ message: "Site is invalid" }),
  title: z.string().default(""),
  description: z.string().default(""),
});

export type SubmitSiteCreate = z.input<typeof submitSiteCreateSchema>;
