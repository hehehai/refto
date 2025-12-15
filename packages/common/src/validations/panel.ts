import { z } from "zod";

// Pagination base schema
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

// User list query
export const userListSchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  status: z.enum(["normal", "ban"]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// User create
export const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
  image: z.string().url().nullable().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// User update
export const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  image: z.string().url().nullable().optional(),
  password: z.string().min(8).optional(),
});

// User form schema (for client-side validation)
export const userFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email"),
    role: z.enum(["ADMIN", "USER"]),
    image: z.string().url().nullable(),
    password: z.string(),
    mode: z.enum(["create", "edit"]),
  })
  .refine(
    (data) => {
      if (data.mode === "create") {
        return data.password && data.password.length >= 8;
      }
      return (
        !data.password ||
        data.password.length === 0 ||
        data.password.length >= 8
      );
    },
    {
      message: "Password must be at least 8 characters",
      path: ["password"],
    }
  );

export type UserFormData = z.infer<typeof userFormSchema>;

// User ban
export const userBanSchema = z.object({
  id: z.string(),
  reason: z.string().min(1, "Ban reason is required"),
  expiresAt: z.coerce.date().optional(),
});

// User ID schema
export const userIdSchema = z.object({
  id: z.string(),
});

// Batch delete users
export const userBatchDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one user ID is required"),
});

// Submit site list (admin)
export const panelSubmitSiteListSchema = paginationSchema.extend({
  search: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
  sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Submit site ID schema
export const submitSiteIdSchema = z.object({
  id: z.number(),
});

// Submit site reject
export const submitSiteRejectSchema = z.object({
  id: z.number(),
  reason: z.string().min(1, "Reject reason is required"),
});

// Stats period
export const statPeriodSchema = z.object({
  period: z.enum(["24h", "7d", "15d", "30d"]).default("24h"),
});

// Type exports
export type UserList = z.infer<typeof userListSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserBan = z.infer<typeof userBanSchema>;
export type UserBatchDelete = z.infer<typeof userBatchDeleteSchema>;
export type PanelSubmitSiteList = z.infer<typeof panelSubmitSiteListSchema>;
export type SubmitSiteReject = z.infer<typeof submitSiteRejectSchema>;
export type StatPeriod = z.infer<typeof statPeriodSchema>;
