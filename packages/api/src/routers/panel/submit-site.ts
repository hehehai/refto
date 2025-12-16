import { ORPCError } from "@orpc/server";
import {
  panelSubmitSiteListSchema,
  submitSiteDeleteSchema,
  submitSiteIdSchema,
  submitSiteRejectSchema,
} from "@refto-one/common";
import { db } from "@refto-one/db";
import { user } from "@refto-one/db/schema/auth";
import { submitSite } from "@refto-one/db/schema/submissions";
import { and, count, eq, ilike, isNull, or, type SQL } from "drizzle-orm";
import { adminProcedure } from "../../index";
import {
  buildPaginationResult,
  getCountFromResult,
  getPaginationOffset,
  getSortOrder,
} from "../../lib/utils";

export const panelSubmitSiteRouter = {
  // List all submissions with pagination, search, filter, sort
  list: adminProcedure
    .input(panelSubmitSiteListSchema)
    .handler(async ({ input }) => {
      const { page, pageSize, search, userId, status, sortBy, sortOrder } =
        input;
      const offset = getPaginationOffset({ page, pageSize });

      // Build where conditions
      const conditions: SQL[] = [isNull(submitSite.deletedAt)];

      // Only filter by status if not "ALL"
      if (status !== "ALL") {
        conditions.push(eq(submitSite.status, status));
      }

      if (search) {
        conditions.push(
          or(
            ilike(submitSite.siteTitle, `%${search}%`),
            ilike(submitSite.siteUrl, `%${search}%`)
          )!
        );
      }

      if (userId) {
        conditions.push(eq(submitSite.userId, userId));
      }

      const whereClause = and(...conditions);

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(submitSite)
        .where(whereClause);
      const total = getCountFromResult(totalResult);

      // Build order by
      const sortColumn =
        sortBy === "updatedAt" ? submitSite.updatedAt : submitSite.createdAt;

      // Get submissions with user info
      const submissions = await db
        .select({
          id: submitSite.id,
          email: submitSite.email,
          siteUrl: submitSite.siteUrl,
          siteTitle: submitSite.siteTitle,
          siteDescription: submitSite.siteDescription,
          status: submitSite.status,
          createdAt: submitSite.createdAt,
          updatedAt: submitSite.updatedAt,
          approvedAt: submitSite.approvedAt,
          rejectedAt: submitSite.rejectedAt,
          rejectReason: submitSite.rejectReason,
          userId: submitSite.userId,
          userName: user.name,
        })
        .from(submitSite)
        .leftJoin(user, eq(submitSite.userId, user.id))
        .where(whereClause)
        .orderBy(getSortOrder(sortColumn, sortOrder))
        .limit(pageSize)
        .offset(offset);

      return buildPaginationResult(submissions, total, { page, pageSize });
    }),

  // Approve a submission
  approve: adminProcedure
    .input(submitSiteIdSchema)
    .handler(async ({ input }) => {
      const existing = await db.query.submitSite.findFirst({
        where: and(eq(submitSite.id, input.id), isNull(submitSite.deletedAt)),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Submission not found" });
      }

      if (existing.status === "APPROVED") {
        throw new ORPCError("BAD_REQUEST", {
          message: "Submission already approved",
        });
      }

      const [updated] = await db
        .update(submitSite)
        .set({
          status: "APPROVED",
          approvedAt: new Date(),
          rejectedAt: null,
          rejectReason: null,
          updatedAt: new Date(),
        })
        .where(eq(submitSite.id, input.id))
        .returning();

      return updated;
    }),

  // Reject a submission
  reject: adminProcedure
    .input(submitSiteRejectSchema)
    .handler(async ({ input }) => {
      const { id, reason } = input;

      const existing = await db.query.submitSite.findFirst({
        where: and(eq(submitSite.id, id), isNull(submitSite.deletedAt)),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Submission not found" });
      }

      if (existing.status === "REJECTED") {
        throw new ORPCError("BAD_REQUEST", {
          message: "Submission already rejected",
        });
      }

      const [updated] = await db
        .update(submitSite)
        .set({
          status: "REJECTED",
          rejectedAt: new Date(),
          rejectReason: reason,
          approvedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(submitSite.id, id))
        .returning();

      return updated;
    }),

  // Soft delete a submission
  delete: adminProcedure
    .input(submitSiteDeleteSchema)
    .handler(async ({ input }) => {
      const existing = await db.query.submitSite.findFirst({
        where: and(eq(submitSite.id, input.id), isNull(submitSite.deletedAt)),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Submission not found" });
      }

      const [updated] = await db
        .update(submitSite)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(submitSite.id, input.id))
        .returning();

      return updated;
    }),
};
