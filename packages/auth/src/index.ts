import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@refto-one/db";
import * as schema from "@refto-one/db/schema/auth";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
	},
  plugins: [tanstackStartCookies()]
});
