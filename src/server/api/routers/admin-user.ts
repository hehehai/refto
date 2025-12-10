import { ORPCError } from "@orpc/server";
import { and, count, eq, gte, ilike, lte, or, type SQL } from "drizzle-orm";
import { z } from "zod";

import { account, db, session, submitSite, type User, user } from "@/lib/db";
import { buildOrderByClause } from "@/lib/db-utils";
import { pagination } from "@/lib/pagination";
import { formatOrders, genOrderValidSchema } from "@/lib/utils";
import { adminProcedure } from "@/server/api/orpc";

// Query users with filters
const queryProcedure = adminProcedure
  .input(
    z.object({
      search: z.coerce.string().trim().max(1024).optional(),
      limit: z.number().min(1).max(50).optional().default(10),
      page: z.number().min(0).optional().default(0),
      role: z.enum(["USER", "ADMIN"]).optional(),
      status: z.enum(["active", "banned"]).optional(),
      createdAtStart: z.coerce.date().optional(),
      createdAtEnd: z.coerce.date().optional(),
      orderBy: genOrderValidSchema<User>(["createdAt", "name", "email"])
        .optional()
        .transform((v) => (v?.length ? v : ["-createdAt"]))
        .transform(formatOrders),
    })
  )
  .handler(async ({ input }) => {
    const {
      search,
      limit,
      page,
      role,
      status,
      createdAtStart,
      createdAtEnd,
      orderBy,
    } = input;

    const conditions: SQL[] = [];

    // Search by name or email
    if (search) {
      const searchCondition = or(
        ilike(user.name, `%${search}%`),
        ilike(user.email, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Filter by role
    if (role) {
      conditions.push(eq(user.role, role));
    }

    // Filter by status (active/banned)
    if (status === "banned") {
      conditions.push(eq(user.banned, true));
    } else if (status === "active") {
      conditions.push(eq(user.banned, false));
    }

    // Filter by created date range
    if (createdAtStart) {
      conditions.push(gte(user.createdAt, createdAtStart));
    }
    if (createdAtEnd) {
      conditions.push(lte(user.createdAt, createdAtEnd));
    }

    const orderByClause = buildOrderByClause(orderBy, {
      id: user.id,
      createdAt: user.createdAt,
      name: user.name,
      email: user.email,
    });

    // Get users with submission count
    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        emailVerified: user.emailVerified,
      })
      .from(user)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(...orderByClause)
      .limit(limit)
      .offset(page * limit);

    // Get submission counts for these users
    const userIds = rows.map((r) => r.id);
    const submissionCounts = await db
      .select({
        userId: submitSite.userId,
        count: count(),
      })
      .from(submitSite)
      .where(
        userIds.length > 0
          ? or(...userIds.map((id) => eq(submitSite.userId, id)))
          : undefined
      )
      .groupBy(submitSite.userId);

    const submissionCountMap = new Map(
      submissionCounts.map((sc) => [sc.userId, sc.count])
    );

    // Combine data
    const enrichedRows = rows.map((r) => ({
      ...r,
      submissionCount: submissionCountMap.get(r.id) ?? 0,
    }));

    const [totalResult] = await db
      .select({ count: count() })
      .from(user)
      .where(conditions.length ? and(...conditions) : undefined);

    const total = totalResult?.count ?? 0;

    return {
      rows: enrichedRows,
      ...pagination(page, limit, total),
    };
  });

// Get single user detail
const detailProcedure = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const [userRow] = await db
      .select()
      .from(user)
      .where(eq(user.id, input.id))
      .limit(1);

    if (!userRow) {
      throw new ORPCError("NOT_FOUND", { message: "User not found" });
    }

    // Get submission count
    const [submissionCountResult] = await db
      .select({ count: count() })
      .from(submitSite)
      .where(eq(submitSite.userId, input.id));

    // Get accounts (providers)
    const accounts = await db
      .select({
        id: account.id,
        providerId: account.providerId,
        createdAt: account.createdAt,
      })
      .from(account)
      .where(eq(account.userId, input.id));

    return {
      ...userRow,
      submissionCount: submissionCountResult?.count ?? 0,
      accounts,
    };
  });

// Update user (name, email, image)
const updateProcedure = adminProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
      image: z.string().url().optional().nullable(),
    })
  )
  .handler(async ({ input }) => {
    const { id, ...updateData } = input;

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!existingUser) {
      throw new ORPCError("NOT_FOUND", { message: "User not found" });
    }

    // Check email uniqueness if updating email
    if (updateData.email && updateData.email !== existingUser.email) {
      const [emailExists] = await db
        .select()
        .from(user)
        .where(eq(user.email, updateData.email))
        .limit(1);

      if (emailExists) {
        throw new ORPCError("CONFLICT", { message: "Email already in use" });
      }
    }

    const [updatedUser] = await db
      .update(user)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))
      .returning();

    return updatedUser;
  });

// Reset password (remove password from credential account)
const resetPasswordProcedure = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    // Find credential account
    const [credentialAccount] = await db
      .select()
      .from(account)
      .where(
        and(eq(account.userId, input.id), eq(account.providerId, "credential"))
      )
      .limit(1);

    if (!credentialAccount) {
      throw new ORPCError("NOT_FOUND", {
        message: "User does not have a password account",
      });
    }

    // Remove password
    await db
      .update(account)
      .set({
        password: null,
        updatedAt: new Date(),
      })
      .where(eq(account.id, credentialAccount.id));

    return { success: true };
  });

// Ban user
const banProcedure = adminProcedure
  .input(
    z.object({
      id: z.string(),
      reason: z.string().max(500).optional(),
      expires: z.coerce.date().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const { id, reason, expires } = input;

    // Prevent self-ban
    if (context.session?.user.id === id) {
      throw new ORPCError("BAD_REQUEST", { message: "Cannot ban yourself" });
    }

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!existingUser) {
      throw new ORPCError("NOT_FOUND", { message: "User not found" });
    }

    // Ban user
    await db
      .update(user)
      .set({
        banned: true,
        banReason: reason ?? null,
        banExpires: expires ?? null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id));

    // Invalidate all sessions for this user
    await db.delete(session).where(eq(session.userId, id));

    return { success: true };
  });

// Unban user
const unbanProcedure = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, input.id))
      .limit(1);

    if (!existingUser) {
      throw new ORPCError("NOT_FOUND", { message: "User not found" });
    }

    await db
      .update(user)
      .set({
        banned: false,
        banReason: null,
        banExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, input.id));

    return { success: true };
  });

// Delete user
const deleteProcedure = adminProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    // Prevent self-deletion
    if (context.session?.user.id === input.id) {
      throw new ORPCError("BAD_REQUEST", { message: "Cannot delete yourself" });
    }

    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, input.id))
      .limit(1);

    if (!existingUser) {
      throw new ORPCError("NOT_FOUND", { message: "User not found" });
    }

    // Delete user (cascades to sessions, accounts due to FK)
    await db.delete(user).where(eq(user.id, input.id));

    return { success: true };
  });

export const adminUserRouter = {
  query: queryProcedure,
  detail: detailProcedure,
  update: updateProcedure,
  resetPassword: resetPasswordProcedure,
  ban: banProcedure,
  unban: unbanProcedure,
  delete: deleteProcedure,
};
