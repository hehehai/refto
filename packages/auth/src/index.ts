import { getBaseUrl, site } from "@refto-one/common";
import { createDb, db } from "@refto-one/db";
import * as schema from "@refto-one/db/schema/auth";
import { sitePageVersionLikes } from "@refto-one/db/schema/sites";
import { submitSite } from "@refto-one/db/schema/submissions";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { createAuthPlugins } from "./plugins";

// Type for Cloudflare env bindings
export interface CloudflareEnv {
  HYPERDRIVE?: { connectionString: string };
  CACHE?: KVNamespace;
  // Environment variables
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_SECRET?: string;
  CORS_ORIGIN?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

// Helper to get env value with fallback to process.env
function getEnvValue(
  env: CloudflareEnv | undefined,
  key: keyof CloudflareEnv
): string {
  if (env && key in env) {
    return (env[key] as string) ?? "";
  }
  return process.env[key] ?? "";
}

// Factory function to create auth instance per request
// This is required for Cloudflare Workers where I/O objects cannot be shared across requests
export function createAuth(env?: CloudflareEnv) {
  // Get connection string from env or use default
  const connectionString = env?.HYPERDRIVE?.connectionString;

  // Use createDb with connection string for runtime, or global db for CLI/build time
  const database = connectionString ? createDb(connectionString) : db;

  // Create KV-based secondary storage if available
  const secondaryStorage = env?.CACHE
    ? {
        get: async (key: string) => env.CACHE!.get(key),
        set: async (key: string, value: string, ttl?: number) => {
          // Cloudflare KV has minimum TTL of 60 seconds
          const expirationTtl = ttl ? Math.max(ttl, 60) : undefined;
          await env.CACHE!.put(
            key,
            value,
            expirationTtl ? { expirationTtl } : undefined
          );
        },
        delete: async (key: string) => env.CACHE!.delete(key),
      }
    : undefined;

  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "pg",
      schema,
    }),

    baseURL: getEnvValue(env, "BETTER_AUTH_URL"),
    secret: getEnvValue(env, "BETTER_AUTH_SECRET"),
    trustedOrigins: [getEnvValue(env, "CORS_ORIGIN")].filter(Boolean),

    ...(secondaryStorage && { secondaryStorage }),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }) => {
        const [name = user.email] = user.email.split("@");
        const userName = user.name || name;

        if (process.env.NODE_ENV === "development") {
          console.info("sendVerificationEmail", {
            email: user.email,
            url,
            token,
          });
        }

        // Lazy load email dependencies to reduce initial bundle size
        const { sendEmail } = await import("@refto-one/email");
        const { VerificationEmail } = await import(
          "@refto-one/email/templates/auth"
        );

        await sendEmail({
          to: user.email,
          subject: `${site.name} | Verify your email`,
          renderData: VerificationEmail({
            name: userName,
            verifyUrl: url,
            verifyCode: token,
            baseUrl: getBaseUrl(),
          }),
        });
      },
      sendOnSignUp: false,
      autoSignInAfterVerification: true,
    },

    socialProviders: {
      github: {
        clientId: getEnvValue(env, "GITHUB_CLIENT_ID"),
        clientSecret: getEnvValue(env, "GITHUB_CLIENT_SECRET"),
      },
      google: {
        clientId: getEnvValue(env, "GOOGLE_CLIENT_ID"),
        clientSecret: getEnvValue(env, "GOOGLE_CLIENT_SECRET"),
      },
    },

    user: {
      changeEmail: {
        enabled: true,
      },
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "USER",
          input: false,
        },
      },
      modelName: "user",
      deleteUser: {
        enabled: true,
        beforeDelete: async (user) => {
          // Create a new db connection for this request
          const reqDb = connectionString ? createDb(connectionString) : db;

          // Delete all user likes
          await reqDb
            .delete(sitePageVersionLikes)
            .where(eq(sitePageVersionLikes.userId, user.id));

          // Delete all user submissions
          await reqDb.delete(submitSite).where(eq(submitSite.userId, user.id));
        },
      },
    },

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },

    account: {
      modelName: "account",
    },

    plugins: createAuthPlugins(env),
  });
}

// Default auth instance for CLI/build time (uses global db)
// For runtime in Cloudflare Workers, use createAuth(env) instead
export const auth = createAuth();

// Export type for auth instance
export type Auth = ReturnType<typeof createAuth>;
