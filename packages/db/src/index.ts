import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Get database connection string
// In Cloudflare Workers with Hyperdrive, the connection string is available via env.HYPERDRIVE.connectionString
// With nodejs_compat_populate_process_env, bindings are available on process.env
// For local development, use DATABASE_URL from .env
function getConnectionString(): string {
  // Check if HYPERDRIVE binding exists (Cloudflare Workers environment)
  const hyperdrive = (globalThis as Record<string, unknown>).HYPERDRIVE as
    | { connectionString: string }
    | undefined;
  if (hyperdrive?.connectionString) {
    return hyperdrive.connectionString;
  }

  // Fallback to DATABASE_URL for local development
  return process.env.DATABASE_URL || "";
}

const client = postgres(getConnectionString());

export const db = drizzle(client, { schema });
