import { statPeriodSchema } from "@refto-one/common";
import { db } from "@refto-one/db";
import { user } from "@refto-one/db/schema/auth";
import { submitSite } from "@refto-one/db/schema/submissions";
import { and, count, eq, gte, isNull, lt } from "drizzle-orm";
import { adminProcedure } from "../../index";
import {
  calculateChangePercent,
  getCountFromResult,
  getTimeRange,
} from "../../lib/utils";

export const statRouter = {
  getStats: adminProcedure
    .input(statPeriodSchema)
    .handler(async ({ input }) => {
      const { period } = input;
      const { currentStart, previousStart, previousEnd } = getTimeRange(period);

      // User stats
      const totalUsersCount = getCountFromResult(
        await db.select({ count: count() }).from(user)
      );

      const newUsersCount = getCountFromResult(
        await db
          .select({ count: count() })
          .from(user)
          .where(gte(user.createdAt, currentStart))
      );

      const previousUsersCount = getCountFromResult(
        await db
          .select({ count: count() })
          .from(user)
          .where(
            and(
              gte(user.createdAt, previousStart),
              lt(user.createdAt, previousEnd)
            )
          )
      );

      // Submission stats
      const totalSubmissionsCount = getCountFromResult(
        await db
          .select({ count: count() })
          .from(submitSite)
          .where(isNull(submitSite.deletedAt))
      );

      const pendingSubmissionsCount = getCountFromResult(
        await db
          .select({ count: count() })
          .from(submitSite)
          .where(
            and(eq(submitSite.status, "PENDING"), isNull(submitSite.deletedAt))
          )
      );

      const newSubmissionsCount = getCountFromResult(
        await db
          .select({ count: count() })
          .from(submitSite)
          .where(
            and(
              gte(submitSite.createdAt, currentStart),
              isNull(submitSite.deletedAt)
            )
          )
      );

      const previousSubmissionsCount = getCountFromResult(
        await db
          .select({ count: count() })
          .from(submitSite)
          .where(
            and(
              gte(submitSite.createdAt, previousStart),
              lt(submitSite.createdAt, previousEnd),
              isNull(submitSite.deletedAt)
            )
          )
      );

      return {
        users: {
          total: totalUsersCount,
          newCount: newUsersCount,
          previousCount: previousUsersCount,
          changePercent: calculateChangePercent(
            newUsersCount,
            previousUsersCount
          ),
        },
        submissions: {
          total: totalSubmissionsCount,
          pending: pendingSubmissionsCount,
          newCount: newSubmissionsCount,
          previousCount: previousSubmissionsCount,
          changePercent: calculateChangePercent(
            newSubmissionsCount,
            previousSubmissionsCount
          ),
        },
      };
    }),
};
