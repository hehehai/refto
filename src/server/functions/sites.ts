import {
  and,
  arrayOverlaps,
  count,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  notInArray,
  or,
  sql,
} from "drizzle-orm";

import { db } from "@/lib/db";
import { sitePages, sitePageVersions, sites } from "@/lib/db/schema";
import { buildOrderByClause } from "@/lib/db-utils";
import { pagination } from "@/lib/pagination";
import type { QuerySite, QueryWithCursorSite } from "@/lib/validations/site";

export async function queryWithCursor(input: QueryWithCursorSite) {
  const { search, limit, cursor, orderBy, tags, isPinned } = input;

  const conditions = [isNull(sites.deletedAt)];

  if (isPinned !== undefined) {
    conditions.push(eq(sites.isPinned, isPinned));
  }

  if (search) {
    conditions.push(
      or(
        ilike(sites.title, `%${search}%`),
        ilike(sites.url, `%${search}%`),
        ilike(sites.description, `%${search}%`)
      )!
    );
  }

  if (tags?.length) {
    conditions.push(arrayOverlaps(sites.tags, tags));
  }

  const orderByClause = buildOrderByClause(orderBy, {
    id: sites.id,
    createdAt: sites.createdAt,
    visits: sites.visits,
    rating: sites.rating,
    title: sites.title,
    url: sites.url,
  });

  const rows = await db
    .select({
      id: sites.id,
      url: sites.url,
      title: sites.title,
      logo: sites.logo,
      tags: sites.tags,
      isPinned: sites.isPinned,
      visits: sites.visits,
      rating: sites.rating,
      pageId: sitePages.id,
      pageUrl: sitePages.url,
      versionId: sitePageVersions.id,
      siteOG: sitePageVersions.siteOG,
      webCover: sitePageVersions.webCover,
      webRecord: sitePageVersions.webRecord,
      mobileCover: sitePageVersions.mobileCover,
      mobileRecord: sitePageVersions.mobileRecord,
    })
    .from(sites)
    .innerJoin(
      sitePages,
      and(eq(sitePages.siteId, sites.id), eq(sitePages.isDefault, true))
    )
    .innerJoin(
      sitePageVersions,
      eq(
        sitePageVersions.id,
        sql`(
          SELECT id FROM ${sitePageVersions}
          WHERE ${sitePageVersions.pageId} = ${sitePages.id}
          ORDER BY ${sitePageVersions.versionDate} DESC
          LIMIT 1
        )`
      )
    )
    .where(and(...conditions))
    .orderBy(...orderByClause)
    .limit(limit + 1)
    .offset(cursor ? 1 : 0);

  let nextCursor: string | undefined;
  if (rows.length > limit) {
    const nextItem = rows.pop();
    nextCursor = nextItem?.id;
  }

  return {
    rows,
    nextCursor,
  };
}

export async function query(input: QuerySite) {
  const { search, limit, page, orderBy, tags, isPinned } = input;

  const conditions = [isNull(sites.deletedAt)];

  if (isPinned !== undefined) {
    conditions.push(eq(sites.isPinned, isPinned));
  }

  if (search) {
    conditions.push(
      or(
        ilike(sites.title, `%${search}%`),
        ilike(sites.url, `%${search}%`),
        ilike(sites.description, `%${search}%`)
      )!
    );
  }

  if (tags?.length) {
    conditions.push(arrayOverlaps(sites.tags, tags));
  }

  const orderByClause = buildOrderByClause(orderBy, {
    id: sites.id,
    createdAt: sites.createdAt,
    visits: sites.visits,
    rating: sites.rating,
    title: sites.title,
    url: sites.url,
  });

  const rows = await db
    .select({
      id: sites.id,
      url: sites.url,
      title: sites.title,
      description: sites.description,
      logo: sites.logo,
      tags: sites.tags,
      isPinned: sites.isPinned,
      visits: sites.visits,
      rating: sites.rating,
      pageId: sitePages.id,
      versionId: sitePageVersions.id,
      webCover: sitePageVersions.webCover,
      createdAt: sites.createdAt,
    })
    .from(sites)
    .innerJoin(
      sitePages,
      and(eq(sitePages.siteId, sites.id), eq(sitePages.isDefault, true))
    )
    .innerJoin(
      sitePageVersions,
      eq(
        sitePageVersions.id,
        sql`(
          SELECT id FROM ${sitePageVersions}
          WHERE ${sitePageVersions.pageId} = ${sitePages.id}
          ORDER BY ${sitePageVersions.versionDate} DESC
          LIMIT 1
        )`
      )
    )
    .where(and(...conditions))
    .orderBy(...orderByClause)
    .limit(limit)
    .offset(page * limit);

  const [totalResult] = await db
    .select({ count: count() })
    .from(sites)
    .where(and(...conditions));

  const total = totalResult?.count ?? 0;

  return {
    rows,
    ...pagination(page, limit, total),
  };
}

export async function detail(id: string) {
  "use server";

  const site = await db.query.sites.findFirst({
    where: and(eq(sites.id, id), isNull(sites.deletedAt)),
    with: {
      pages: {
        with: {
          versions: {
            orderBy: desc(sitePageVersions.versionDate),
            limit: 1,
          },
        },
        where: eq(sitePages.isDefault, true),
      },
    },
  });

  if (!site) return null;

  // Flatten the structure for backward compatibility
  const defaultPage = site.pages[0];
  const latestVersion = defaultPage?.versions[0];

  return {
    ...site,
    pageId: defaultPage?.id,
    pageTitle: defaultPage?.title,
    pageUrl: defaultPage?.url,
    versionId: latestVersion?.id,
    siteOG: latestVersion?.siteOG,
    webCover: latestVersion?.webCover,
    webRecord: latestVersion?.webRecord,
    mobileCover: latestVersion?.mobileCover,
    mobileRecord: latestVersion?.mobileRecord,
    versionNote: latestVersion?.versionNote,
  };
}

export async function getWeeklyCount() {
  "use server";

  // Get the start of the current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({ count: count() })
    .from(sites)
    .where(and(gte(sites.createdAt, startOfWeek), isNull(sites.deletedAt)));

  return result?.count ?? 0;
}

export async function correlation(tags: string[], excludeIds?: string[]) {
  "use server";

  const conditions = [arrayOverlaps(sites.tags, tags), isNull(sites.deletedAt)];

  if (excludeIds?.length) {
    conditions.push(notInArray(sites.id, excludeIds));
  }

  const result = await db
    .select({
      id: sites.id,
      url: sites.url,
      title: sites.title,
      logo: sites.logo,
      visits: sites.visits,
      pageId: sitePages.id,
      versionId: sitePageVersions.id,
      webCover: sitePageVersions.webCover,
      webRecord: sitePageVersions.webRecord,
      matchCount: sql<number>`(
        SELECT COUNT(*)
        FROM unnest(${sites.tags}) AS t
        WHERE t = ANY(${sql.raw(`ARRAY[${tags.map((tag) => `'${tag.replace(/'/g, "''")}'`).join(",")}]`)})
      )`.as("match_count"),
    })
    .from(sites)
    .innerJoin(
      sitePages,
      and(eq(sitePages.siteId, sites.id), eq(sitePages.isDefault, true))
    )
    .innerJoin(
      sitePageVersions,
      eq(
        sitePageVersions.id,
        sql`(
          SELECT id FROM ${sitePageVersions}
          WHERE ${sitePageVersions.pageId} = ${sitePages.id}
          ORDER BY ${sitePageVersions.versionDate} DESC
          LIMIT 1
        )`
      )
    )
    .where(and(...conditions))
    .orderBy(desc(sql`match_count`))
    .limit(6);

  return result.map((site) => ({
    id: site.id,
    url: site.url,
    title: site.title,
    logo: site.logo,
    pageId: site.pageId,
    visits: site.visits,
    versionId: site.versionId,
    webCover: site.webCover,
    webRecord: site.webRecord ?? "",
  }));
}
