import { updateProfileSchema } from "@refto-one/common";
import { db } from "@refto-one/db";
import { session, user } from "@refto-one/db/schema/auth";
import { eq } from "drizzle-orm";
import { protectedProcedure } from "../../index";

export const appUserRouter = {
  // Get current user profile
  getProfile: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;

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

    return profile;
  }),

  // Update user profile (name, image)
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

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

  // Get user's active sessions
  getSessions: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;

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
    });

    // Mark current session
    const currentSessionId = context.session.session.id;

    return sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));
  }),

  // Delete user account (soft delete by banning)
  deleteAccount: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;

    // Soft delete: ban the user with a "self-deleted" reason
    await db
      .update(user)
      .set({
        banned: true,
        banReason: "Account deleted by user",
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    // Invalidate all sessions
    await db.delete(session).where(eq(session.userId, userId));

    return { success: true };
  }),
};
