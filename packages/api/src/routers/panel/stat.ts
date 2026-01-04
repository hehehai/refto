import { likeLeaderboardSchema, statPeriodSchema } from "@refto-one/common";
import { and, count, desc, eq, gte, isNull, lt, sql } from "@refto-one/db";
import { user } from "@refto-one/db/schema/auth";
import { eventLogs } from "@refto-one/db/schema/events";
import {
  sitePageVersionLikes,
  sitePageVersions,
  sites,
} from "@refto-one/db/schema/sites";
import { submitSite } from "@refto-one/db/schema/submissions";
import { adminProcedure } from "../../index";
import {
  calculateChangePercent,
  getCountFromResult,
  getTimeRange,
} from "../../lib/utils";

// Helper to get month start/end dates
function getMonthRange(monthsAgo: number): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() - monthsAgo + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start, end };
}

// Helper to get week start (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Helper to get day start
function getDayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Helper to get leaderboard time range
function getLeaderboardTimeRange(range: string): { start: Date; end: Date } {
  const now = new Date();
  const today = getDayStart(now);

  switch (range) {
    case "today":
      return { start: today, end: now };
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: today };
    }
    case "this_week":
      return { start: getWeekStart(now), end: now };
    case "last_week": {
      const lastWeekStart = getWeekStart(now);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      return { start: lastWeekStart, end: getWeekStart(now) };
    }
    case "this_month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      };
    case "last_month": {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: lastMonthStart, end: thisMonthStart };
    }
    case "this_year":
      return { start: new Date(now.getFullYear(), 0, 1), end: now };
    default:
      return { start: today, end: now };
  }
}

export const statRouter = {
  getStats: adminProcedure
    .input(statPeriodSchema)
    .handler(async ({ input, context }) => {
      const { period } = input;
      const { db } = context;
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

  // Dashboard stats with month-over-month comparison
  getDashboardStats: adminProcedure.handler(async ({ context }) => {
    const { db } = context;
    const thisMonth = getMonthRange(0);
    const lastMonth = getMonthRange(1);

    // Sites
    const totalSites = getCountFromResult(
      await db
        .select({ count: count() })
        .from(sites)
        .where(isNull(sites.deletedAt))
    );
    const thisMonthSites = getCountFromResult(
      await db
        .select({ count: count() })
        .from(sites)
        .where(
          and(isNull(sites.deletedAt), gte(sites.createdAt, thisMonth.start))
        )
    );
    const lastMonthSites = getCountFromResult(
      await db
        .select({ count: count() })
        .from(sites)
        .where(
          and(
            isNull(sites.deletedAt),
            gte(sites.createdAt, lastMonth.start),
            lt(sites.createdAt, lastMonth.end)
          )
        )
    );

    // Versions
    const totalVersions = getCountFromResult(
      await db.select({ count: count() }).from(sitePageVersions)
    );
    const thisMonthVersions = getCountFromResult(
      await db
        .select({ count: count() })
        .from(sitePageVersions)
        .where(gte(sitePageVersions.createdAt, thisMonth.start))
    );
    const lastMonthVersions = getCountFromResult(
      await db
        .select({ count: count() })
        .from(sitePageVersions)
        .where(
          and(
            gte(sitePageVersions.createdAt, lastMonth.start),
            lt(sitePageVersions.createdAt, lastMonth.end)
          )
        )
    );

    // Likes (current total from likes table)
    const totalLikes = getCountFromResult(
      await db.select({ count: count() }).from(sitePageVersionLikes)
    );
    // Monthly new likes from event logs
    const thisMonthLikes = getCountFromResult(
      await db
        .select({ count: count() })
        .from(eventLogs)
        .where(
          and(
            eq(eventLogs.eventType, "VERSION_LIKED"),
            gte(eventLogs.createdAt, thisMonth.start)
          )
        )
    );
    const lastMonthLikes = getCountFromResult(
      await db
        .select({ count: count() })
        .from(eventLogs)
        .where(
          and(
            eq(eventLogs.eventType, "VERSION_LIKED"),
            gte(eventLogs.createdAt, lastMonth.start),
            lt(eventLogs.createdAt, lastMonth.end)
          )
        )
    );

    // Users
    const totalUsers = getCountFromResult(
      await db.select({ count: count() }).from(user)
    );
    const thisMonthUsers = getCountFromResult(
      await db
        .select({ count: count() })
        .from(user)
        .where(gte(user.createdAt, thisMonth.start))
    );
    const lastMonthUsers = getCountFromResult(
      await db
        .select({ count: count() })
        .from(user)
        .where(
          and(
            gte(user.createdAt, lastMonth.start),
            lt(user.createdAt, lastMonth.end)
          )
        )
    );

    return {
      sites: {
        total: totalSites,
        currentMonth: thisMonthSites,
        previousMonth: lastMonthSites,
        changePercent: calculateChangePercent(thisMonthSites, lastMonthSites),
      },
      versions: {
        total: totalVersions,
        currentMonth: thisMonthVersions,
        previousMonth: lastMonthVersions,
        changePercent: calculateChangePercent(
          thisMonthVersions,
          lastMonthVersions
        ),
      },
      likes: {
        total: totalLikes,
        currentMonth: thisMonthLikes,
        previousMonth: lastMonthLikes,
        changePercent: calculateChangePercent(thisMonthLikes, lastMonthLikes),
      },
      users: {
        total: totalUsers,
        currentMonth: thisMonthUsers,
        previousMonth: lastMonthUsers,
        changePercent: calculateChangePercent(thisMonthUsers, lastMonthUsers),
      },
    };
  }),

  // User growth chart data
  getUserGrowthChart: adminProcedure.handler(async ({ context }) => {
    const { db } = context;
    const now = new Date();
    const thisWeekStart = getWeekStart(now);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

    // Get this week's daily user growth
    const thisWeekData: Array<{ day: string; count: number }> = [];
    const lastWeekData: Array<{ day: string; count: number }> = [];

    for (let i = 0; i < 7; i++) {
      // This week
      const thisWeekDayStart = new Date(thisWeekStart);
      thisWeekDayStart.setDate(thisWeekDayStart.getDate() + i);
      const thisWeekDayEnd = new Date(thisWeekDayStart);
      thisWeekDayEnd.setDate(thisWeekDayEnd.getDate() + 1);

      const thisWeekCount = getCountFromResult(
        await db
          .select({ count: count() })
          .from(user)
          .where(
            and(
              gte(user.createdAt, thisWeekDayStart),
              lt(user.createdAt, thisWeekDayEnd)
            )
          )
      );
      thisWeekData.push({ day: dayNames[i] ?? "", count: thisWeekCount });

      // Last week
      const lastWeekDayStart = new Date(lastWeekStart);
      lastWeekDayStart.setDate(lastWeekDayStart.getDate() + i);
      const lastWeekDayEnd = new Date(lastWeekDayStart);
      lastWeekDayEnd.setDate(lastWeekDayEnd.getDate() + 1);

      const lastWeekCount = getCountFromResult(
        await db
          .select({ count: count() })
          .from(user)
          .where(
            and(
              gte(user.createdAt, lastWeekDayStart),
              lt(user.createdAt, lastWeekDayEnd)
            )
          )
      );
      lastWeekData.push({ day: dayNames[i] ?? "", count: lastWeekCount });
    }

    // Get last 3 months user growth
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ] as const;
    const lastThreeMonths: Array<{ month: string; count: number }> = [];

    for (let i = 2; i >= 0; i--) {
      const monthRange = getMonthRange(i);
      const monthCount = getCountFromResult(
        await db
          .select({ count: count() })
          .from(user)
          .where(
            and(
              gte(user.createdAt, monthRange.start),
              lt(user.createdAt, new Date(monthRange.end.getTime() + 1))
            )
          )
      );
      const monthIndex = new Date(monthRange.start).getMonth();
      lastThreeMonths.push({
        month: monthNames[monthIndex] ?? "",
        count: monthCount,
      });
    }

    return {
      thisWeek: thisWeekData,
      lastWeek: lastWeekData,
      lastThreeMonths,
    };
  }),

  // Like leaderboard
  getLikeLeaderboard: adminProcedure
    .input(likeLeaderboardSchema)
    .handler(async ({ input, context }) => {
      const { range, limit } = input;
      const { db } = context;
      const { start, end } = getLeaderboardTimeRange(range);

      // Get likes from event logs within time range, grouped by site
      const leaderboard = await db
        .select({
          siteId: sql<string>`(${eventLogs.metadata}->>'siteId')`.as("siteId"),
          likeCount: count().as("likeCount"),
        })
        .from(eventLogs)
        .where(
          and(
            eq(eventLogs.eventType, "VERSION_LIKED"),
            gte(eventLogs.createdAt, start),
            lt(eventLogs.createdAt, end)
          )
        )
        .groupBy(sql`${eventLogs.metadata}->>'siteId'`)
        .orderBy(desc(count()))
        .limit(limit);

      // Fetch site details for each entry
      const siteIds = leaderboard.map((item) => item.siteId).filter(Boolean);

      if (siteIds.length === 0) {
        return [];
      }

      const siteDetails = await db
        .select({
          id: sites.id,
          title: sites.title,
          logo: sites.logo,
          url: sites.url,
        })
        .from(sites)
        .where(sql`${sites.id} IN ${siteIds}`);

      const siteMap = new Map(siteDetails.map((s) => [s.id, s]));

      return leaderboard
        .map((item) => ({
          site: siteMap.get(item.siteId) ?? null,
          likeCount: item.likeCount,
        }))
        .filter((item) => item.site !== null);
    }),
};
