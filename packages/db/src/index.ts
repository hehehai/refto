import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type DbType = ReturnType<typeof drizzle<typeof schema>>;

function getConnectionString(): string {
  const hyperdrive = (globalThis as Record<string, unknown>).HYPERDRIVE as
    | { connectionString: string }
    | undefined;
  if (hyperdrive?.connectionString) {
    return hyperdrive.connectionString;
  }
  return process.env.DATABASE_URL || "";
}

// 每个请求创建新的数据库实例
// Cloudflare Workers 要求每个请求使用独立的数据库连接
// 可选传入 connectionString，用于从 env.HYPERDRIVE 获取连接
export function createDb(connectionString?: string): DbType {
  const connStr = connectionString ?? getConnectionString();
  const sql = postgres(connStr, {
    prepare: false,
  });
  return drizzle(sql, { schema });
}

// 共享的 db 实例（仅用于 auth 等模块级初始化）
// 注意：在 Cloudflare Workers 请求处理中应使用 createDb()
const sql = postgres(getConnectionString(), {
  prepare: false,
});
export const db = drizzle(sql, { schema });

// 重新导出 drizzle-orm 操作符，确保整个项目使用同一个 drizzle-orm 实例
export {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNull,
  lt,
  lte,
  max,
  ne,
  not,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
export type { PgColumn } from "drizzle-orm/pg-core";
