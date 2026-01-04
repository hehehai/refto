import { ORPCError } from "@orpc/server";
import {
  submitSiteCreateSchema,
  submitSiteUpdateSchema,
} from "@refto-one/common";
import { and, desc, eq, isNull } from "@refto-one/db";
import { submitSite } from "@refto-one/db/schema/submissions";
import { z } from "zod";
import { protectedProcedure } from "../../index";

export const submitSiteRouter = {
  // List user's submitted sites (excluding deleted)
  list: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    const sites = await db
      .select()
      .from(submitSite)
      .where(and(eq(submitSite.userId, userId), isNull(submitSite.deletedAt)))
      .orderBy(desc(submitSite.createdAt));

    return sites;
  }),

  // Create a new site submission
  create: protectedProcedure
    .input(submitSiteCreateSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const email = context.session.user.email;
      const { db } = context;

      const [site] = await db
        .insert(submitSite)
        .values({
          ...input,
          userId,
          email,
          status: "PENDING",
        })
        .returning();

      return site;
    }),

  // Update a site submission (only PENDING/REJECTED can be edited)
  update: protectedProcedure
    .input(submitSiteUpdateSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { id, ...updateData } = input;
      const { db } = context;

      // Check if site exists and belongs to user
      const [existing] = await db
        .select()
        .from(submitSite)
        .where(
          and(
            eq(submitSite.id, id),
            eq(submitSite.userId, userId),
            isNull(submitSite.deletedAt)
          )
        );

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Site not found" });
      }

      // Cannot edit approved sites
      if (existing.status === "APPROVED") {
        throw new ORPCError("FORBIDDEN", {
          message: "Cannot edit approved sites",
        });
      }

      // If rejected, reset to pending and clear rejection info
      const statusUpdate =
        existing.status === "REJECTED"
          ? {
              status: "PENDING" as const,
              rejectedAt: null,
              rejectReason: null,
            }
          : {};

      const [updated] = await db
        .update(submitSite)
        .set({
          ...updateData,
          ...statusUpdate,
          updatedAt: new Date(),
        })
        .where(eq(submitSite.id, id))
        .returning();

      return updated;
    }),

  // Soft delete a site submission
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { db } = context;

      // Check if site exists and belongs to user
      const [existing] = await db
        .select()
        .from(submitSite)
        .where(
          and(
            eq(submitSite.id, input.id),
            eq(submitSite.userId, userId),
            isNull(submitSite.deletedAt)
          )
        );

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Site not found" });
      }

      const [deleted] = await db
        .update(submitSite)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(submitSite.id, input.id))
        .returning();

      return deleted;
    }),
};
