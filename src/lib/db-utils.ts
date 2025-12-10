import { and, asc, count, desc, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { pagination } from "@/lib/pagination";

type OrderByItem = { key: string; dir: "asc" | "desc" };

/**
 * Generic function to build Drizzle orderBy clauses from an array of sort items
 * @param orderBy Array of order items with key and direction
 * @param columnMap Map of column keys to Drizzle column objects
 * @returns Array of SQL order by clauses
 */
export function buildOrderByClause<TColumns extends Record<string, PgColumn>>(
  orderBy: OrderByItem[] | undefined,
  columnMap: TColumns
): SQL[] {
  if (!orderBy?.length) return [];

  return orderBy
    .map((item) => {
      const column = columnMap[item.key];
      if (!column) return null;
      return item.dir === "desc" ? desc(column) : asc(column);
    })
    .filter((item): item is SQL => item !== null);
}

/**
 * Generic function to execute a paginated query
 * @param params Query parameters including table, conditions, ordering, and pagination
 * @returns Paginated result with rows and pagination metadata
 */
export async function executePaginatedQuery<_TTable, TResult>({
  table,
  select,
  conditions = [],
  orderBy = [],
  limit,
  page,
}: {
  table: any;
  select?: any;
  conditions?: SQL[];
  orderBy?: SQL[];
  limit: number;
  page: number;
}): Promise<{ rows: TResult[]; page: number; maxPage: number; total: number }> {
  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select(select)
    .from(table)
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(limit)
    .offset(page * limit);

  const [totalResult] = await db
    .select({ count: count() })
    .from(table)
    .where(whereClause);

  const total = totalResult?.count ?? 0;

  return {
    rows: rows as TResult[],
    ...pagination(page, limit, total),
  };
}
