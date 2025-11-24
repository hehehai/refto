import {
  and,
  arrayOverlaps,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNull,
  notInArray,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

import { db, refSite } from "@/db";
import { pagination } from "@/lib/pagination";
import type {
  QueryRefSite,
  QueryWithCursorRefSite,
} from "@/lib/validations/ref-site";

type OrderByItem = { key: string; dir: "asc" | "desc" };

function buildRefSiteOrderByClause(orderBy: OrderByItem[] | undefined): SQL[] {
  if (!orderBy?.length) return [];

  const columnMap: Record<string, PgColumn> = {
    id: refSite.id,
    createdAt: refSite.createdAt,
    visits: refSite.visits,
    siteName: refSite.siteName,
    siteTitle: refSite.siteTitle,
    siteUrl: refSite.siteUrl,
  };

  return orderBy
    .map((item) => {
      const column = columnMap[item.key];
      if (!column) return null;
      return item.dir === "desc" ? desc(column) : asc(column);
    })
    .filter((item): item is SQL => item !== null);
}

export async function queryWithCursor(input: QueryWithCursorRefSite) {
  const { search, limit, cursor, orderBy, tags, hasTop } = input;

  const conditions = [isNull(refSite.deletedAt), eq(refSite.isTop, !!hasTop)];

  if (search) {
    conditions.push(
      or(
        ilike(refSite.siteName, `%${search}%`),
        ilike(refSite.siteTitle, `%${search}%`),
        ilike(refSite.siteUrl, `%${search}%`)
      )!
    );
  }

  if (tags.length) {
    conditions.push(arrayOverlaps(refSite.siteTags, tags));
  }

  const orderByClause = buildRefSiteOrderByClause(orderBy);

  const rows = await db
    .select({
      id: refSite.id,
      siteUrl: refSite.siteUrl,
      siteName: refSite.siteName,
      siteFavicon: refSite.siteFavicon,
      siteCover: refSite.siteCover,
      siteCoverRecord: refSite.siteCoverRecord,
      siteCoverHeight: refSite.siteCoverHeight,
      siteCoverWidth: refSite.siteCoverWidth,
      visits: refSite.visits,
    })
    .from(refSite)
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

export async function query(input: QueryRefSite) {
  const { search, limit, page, orderBy, tags } = input;

  const conditions = [isNull(refSite.deletedAt)];

  if (search) {
    conditions.push(
      or(
        ilike(refSite.siteName, `%${search}%`),
        ilike(refSite.siteTitle, `%${search}%`),
        ilike(refSite.siteUrl, `%${search}%`)
      )!
    );
  }

  if (tags.length) {
    conditions.push(arrayOverlaps(refSite.siteTags, tags));
  }

  const orderByClause = buildRefSiteOrderByClause(orderBy);

  const rows = await db
    .select({
      id: refSite.id,
      siteUrl: refSite.siteUrl,
      siteName: refSite.siteName,
      siteTitle: refSite.siteTitle,
      siteFavicon: refSite.siteFavicon,
      siteCover: refSite.siteCover,
      createdAt: refSite.createdAt,
      visits: refSite.visits,
      siteTags: refSite.siteTags,
      isTop: refSite.isTop,
    })
    .from(refSite)
    .where(and(...conditions))
    .orderBy(...orderByClause)
    .limit(limit)
    .offset(page * limit);

  const [totalResult] = await db
    .select({ count: count() })
    .from(refSite)
    .where(and(...conditions));

  const total = totalResult?.count ?? 0;

  return {
    rows,
    ...pagination(page, limit, total),
  };
}

export async function detail(id: string) {
  "use server";
  return db.query.refSite.findFirst({
    where: and(eq(refSite.id, id), isNull(refSite.deletedAt)),
  });
}

export async function correlation(tags: string[], excludeIds?: string[]) {
  "use server";

  const conditions = [arrayOverlaps(refSite.siteTags, tags)];

  if (excludeIds?.length) {
    conditions.push(notInArray(refSite.id, excludeIds));
  }

  const sites = await db
    .select({
      id: refSite.id,
      siteUrl: refSite.siteUrl,
      siteName: refSite.siteName,
      siteFavicon: refSite.siteFavicon,
      siteCover: refSite.siteCover,
      siteCoverRecord: refSite.siteCoverRecord,
      siteCoverWidth: refSite.siteCoverWidth,
      siteCoverHeight: refSite.siteCoverHeight,
      visits: refSite.visits,
      matchCount: sql<number>`(
        SELECT COUNT(*)
        FROM unnest(${refSite.siteTags}) AS t
        WHERE t = ANY(${sql.raw(`ARRAY[${tags.map((tag) => `'${tag.replace(/'/g, "''")}'`).join(",")}]`)})
      )`.as("match_count"),
    })
    .from(refSite)
    .where(and(...conditions))
    .orderBy(desc(sql`match_count`))
    .limit(6);

  return sites.map((site) => ({
    id: site.id,
    siteUrl: site.siteUrl,
    siteName: site.siteName,
    siteFavicon: site.siteFavicon,
    siteCover: site.siteCover,
    siteCoverRecord: site.siteCoverRecord ?? "",
    siteCoverWidth: site.siteCoverWidth,
    siteCoverHeight: site.siteCoverHeight,
    visits: site.visits,
  }));
}
