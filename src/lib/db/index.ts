import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/env";
import * as schema from "./schema/index";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const createDrizzleClient = () =>
  drizzle(pool, {
    schema,
    logger: env.NODE_ENV === "development",
  });

const globalForDrizzle = globalThis as unknown as {
  db: ReturnType<typeof createDrizzleClient> | undefined;
};

export const db = globalForDrizzle.db ?? createDrizzleClient();

if (env.NODE_ENV !== "production") globalForDrizzle.db = db;

export * from "./schema/index";
