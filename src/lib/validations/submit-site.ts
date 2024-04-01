import { z } from "zod";

export const submitSiteCreateSchema = (locale: string) =>
  z.object({
    email: z.string().email({
      message: { en: "Email is invalid", "zh-CN": "邮箱格式不正确" }[locale],
    }),
    site: z.string().url({
      message: { en: "Site is invalid", "zh-CN": "网站格式不正确" }[locale],
    }),
    title: z.string().optional().or(z.literal("")).default(""),
    description: z.string().optional().or(z.literal("")).default(""),
  });

export type SubmitSiteCreate = z.infer<
  ReturnType<typeof submitSiteCreateSchema>
>;
