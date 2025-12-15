import { ORPCError } from "@orpc/server";
import {
  userBanSchema,
  userBatchDeleteSchema,
  userCreateSchema,
  userIdSchema,
  userListSchema,
  userUpdateSchema,
} from "@refto-one/common";
import { db } from "@refto-one/db";
import { account, session, user } from "@refto-one/db/schema/auth";
import {
  and,
  count,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  type SQL,
} from "drizzle-orm";
import { adminProcedure } from "../../index";
import {
  buildPaginationResult,
  generateId,
  getCountFromResult,
  getPaginationOffset,
  getSortOrder,
  hashPassword,
} from "../../lib/utils";

export const userRouter = {
  // List users with pagination, search, filter, sort
  list: adminProcedure.input(userListSchema).handler(async ({ input }) => {
    const {
      page,
      pageSize,
      search,
      role,
      status,
      dateFrom,
      dateTo,
      sortOrder,
    } = input;
    const offset = getPaginationOffset({ page, pageSize });

    // Build where conditions
    const conditions: SQL[] = [];

    if (search) {
      const searchCondition = or(
        ilike(user.name, `%${search}%`),
        ilike(user.email, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (role) {
      conditions.push(eq(user.role, role));
    }

    if (status === "ban") {
      conditions.push(eq(user.banned, true));
    } else if (status === "normal") {
      conditions.push(eq(user.banned, false));
    }

    if (dateFrom) {
      conditions.push(gte(user.createdAt, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(user.createdAt, dateTo));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(user)
      .where(whereClause);
    const total = getCountFromResult(totalResult);

    // Get users
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        banned: user.banned,
        banReason: user.banReason,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(whereClause)
      .orderBy(getSortOrder(user.createdAt, sortOrder))
      .limit(pageSize)
      .offset(offset);

    return buildPaginationResult(users, total, { page, pageSize });
  }),

  // Get user by ID with sessions and accounts
  getById: adminProcedure.input(userIdSchema).handler(async ({ input }) => {
    const userData = await db.query.user.findFirst({
      where: eq(user.id, input.id),
      with: {
        sessions: {
          columns: {
            id: true,
            createdAt: true,
            expiresAt: true,
            ipAddress: true,
            userAgent: true,
          },
        },
        accounts: {
          columns: {
            id: true,
            providerId: true,
            accountId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!userData) {
      throw new ORPCError("NOT_FOUND", { message: "User not found" });
    }

    return userData;
  }),

  // Create user
  create: adminProcedure.input(userCreateSchema).handler(async ({ input }) => {
    const { password, ...userData } = input;

    // Check if email already exists
    const existing = await db.query.user.findFirst({
      where: eq(user.email, input.email),
    });

    if (existing) {
      throw new ORPCError("CONFLICT", { message: "Email already exists" });
    }

    const userId = generateId();
    const hashedPassword = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(user)
      .values({
        id: userId,
        ...userData,
        emailVerified: true,
      })
      .returning();

    // Create account with password
    await db.insert(account).values({
      id: generateId(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
    });

    return newUser;
  }),

  // Update user
  update: adminProcedure.input(userUpdateSchema).handler(async ({ input }) => {
    const { id, password, ...updateData } = input;

    // Check if user exists
    const existing = await db.query.user.findFirst({
      where: eq(user.id, id),
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "User not found" });
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existing.email) {
      const emailExists = await db.query.user.findFirst({
        where: eq(user.email, updateData.email),
      });

      if (emailExists) {
        throw new ORPCError("CONFLICT", { message: "Email already exists" });
      }
    }

    // Update user
    const [updated] = await db
      .update(user)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))
      .returning();

    // Update password if provided
    if (password) {
      const hashedPassword = await hashPassword(password);
      await db
        .update(account)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(
          and(eq(account.userId, id), eq(account.providerId, "credential"))
        );
    }

    return updated;
  }),

  // Delete user (physical delete)
  // TODO: Implement related data deletion in the future
  delete: adminProcedure.input(userIdSchema).handler(async ({ input }) => {
    const existing = await db.query.user.findFirst({
      where: eq(user.id, input.id),
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "User not found" });
    }

    // Delete user (cascade will handle sessions and accounts)
    await db.delete(user).where(eq(user.id, input.id));

    return { success: true };
  }),

  // Batch delete users (physical delete)
  // TODO: Implement related data deletion in the future
  batchDelete: adminProcedure
    .input(userBatchDeleteSchema)
    .handler(async ({ input }) => {
      const { ids } = input;

      // Delete users (cascade will handle sessions and accounts)
      await db.delete(user).where(inArray(user.id, ids));

      return { success: true, deletedCount: ids.length };
    }),

  // Ban user
  ban: adminProcedure.input(userBanSchema).handler(async ({ input }) => {
    const { id, reason, expiresAt } = input;

    const existing = await db.query.user.findFirst({
      where: eq(user.id, id),
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "User not found" });
    }

    const [updated] = await db
      .update(user)
      .set({
        banned: true,
        banReason: reason,
        banExpires: expiresAt ?? null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))
      .returning();

    // Invalidate all user sessions
    await db.delete(session).where(eq(session.userId, id));

    return updated;
  }),

  // Unban user
  unban: adminProcedure.input(userIdSchema).handler(async ({ input }) => {
    const existing = await db.query.user.findFirst({
      where: eq(user.id, input.id),
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "User not found" });
    }

    const [updated] = await db
      .update(user)
      .set({
        banned: false,
        banReason: null,
        banExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, input.id))
      .returning();

    return updated;
  }),
};
