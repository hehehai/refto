import { z } from "zod";

export const submitSiteCreateSchema = z.object({
  email: z.string().email({
    message: "Email is invalid",
  }),
  site: z.string().url({
    message: "Site is invalid",
  }),
  title: z.string().default(""),
  description: z.string().default(""),
});

export type SubmitSiteCreate = z.input<typeof submitSiteCreateSchema>;
