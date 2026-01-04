import { ORPCError } from "@orpc/server";
import { updateProfileSchema } from "@refto-one/common";
import { and, eq, isNull, ne } from "@refto-one/db";
import { account, session, user } from "@refto-one/db/schema/auth";
import { sitePageVersionLikes } from "@refto-one/db/schema/sites";
import { submitSite } from "@refto-one/db/schema/submissions";
import { z } from "zod";
import { protectedProcedure } from "../../index";
import { generateId, hashPassword } from "../../lib/utils";

export const appUserRouter = {
  // Get current user profile
  getProfile: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    const profile = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    // Check if user has credential (password) account
    const credentialAccount = await db.query.account.findFirst({
      where: and(
        eq(account.userId, userId),
        eq(account.providerId, "credential")
      ),
      columns: { id: true },
    });

    return {
      ...profile,
      hasCredential: !!credentialAccount,
    };
  }),

  // Update user profile (name, image)
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { db } = context;

      const updateData: { name?: string; image?: string | null } = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }

      if (input.image !== undefined) {
        updateData.image = input.image;
      }

      if (Object.keys(updateData).length === 0) {
        // Nothing to update, return current profile
        return await db.query.user.findFirst({
          where: eq(user.id, userId),
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        });
      }

      const [updated] = await db
        .update(user)
        .set(updateData)
        .where(eq(user.id, userId))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        });

      return updated;
    }),

  // Get user's active sessions (latest 5)
  getSessions: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    const sessions = await db.query.session.findMany({
      where: eq(session.userId, userId),
      orderBy: (s, { desc }) => [desc(s.createdAt)],
      columns: {
        id: true,
        token: false,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      limit: 5,
    });

    // Mark current session
    const currentSessionId = context.session.session.id;

    return sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));
  }),

  // Get linked OAuth accounts
  getLinkedAccounts: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    const accounts = await db.query.account.findMany({
      where: eq(account.userId, userId),
      columns: {
        id: true,
        providerId: true,
        accountId: true,
        createdAt: true,
      },
    });

    return accounts;
  }),

  // Revoke a session
  revokeSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const currentSessionId = context.session.session.id;
      const { db } = context;

      // Cannot revoke current session
      if (input.sessionId === currentSessionId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Cannot revoke current session",
        });
      }

      // Verify session belongs to user and delete it
      const result = await db
        .delete(session)
        .where(
          and(
            eq(session.id, input.sessionId),
            eq(session.userId, userId),
            ne(session.id, currentSessionId)
          )
        )
        .returning({ id: session.id });

      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Session not found",
        });
      }

      return { success: true };
    }),

  // Delete all user submissions (soft delete)
  deleteAllSubmissions: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    const result = await db
      .update(submitSite)
      .set({ deletedAt: new Date() })
      .where(and(eq(submitSite.userId, userId), isNull(submitSite.deletedAt)))
      .returning({ id: submitSite.id });

    return { deletedCount: result.length };
  }),

  // Delete all user likes
  deleteAllLikes: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    const result = await db
      .delete(sitePageVersionLikes)
      .where(eq(sitePageVersionLikes.userId, userId))
      .returning({ id: sitePageVersionLikes.id });

    return { deletedCount: result.length };
  }),

  // Set password for users without credential account (OAuth-only users)
  setPassword: protectedProcedure
    .input(z.object({ newPassword: z.string().min(8) }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { db } = context;

      // Check if user already has a credential account
      const existingCredential = await db.query.account.findFirst({
        where: and(
          eq(account.userId, userId),
          eq(account.providerId, "credential")
        ),
        columns: { id: true },
      });

      if (existingCredential) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Password already set. Use change password instead.",
        });
      }

      // Create credential account with password
      const hashedPassword = await hashPassword(input.newPassword);

      await db.insert(account).values({
        id: generateId(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashedPassword,
      });

      return { success: true };
    }),
};
