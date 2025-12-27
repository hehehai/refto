import { getBaseUrl, site } from "@refto-one/common";
import { db } from "@refto-one/db";
import * as schema from "@refto-one/db/schema/auth";
import { sitePageVersionLikes } from "@refto-one/db/schema/sites";
import { submitSite } from "@refto-one/db/schema/submissions";
import { sendEmail } from "@refto-one/email";
import { VerificationEmail } from "@refto-one/email/templates/auth";
import { env } from "@refto-one/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { authPlugins } from "./plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema,
  }),

  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  trustedOrigins: [env.CORS_ORIGIN || ""],

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
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
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
        // Delete all user likes
        await db
          .delete(sitePageVersionLikes)
          .where(eq(sitePageVersionLikes.userId, user.id));

        // Delete all user submissions
        await db.delete(submitSite).where(eq(submitSite.userId, user.id));
      },
    },
  },

  session: {
    modelName: "session",
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update session every day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  account: {
    modelName: "account",
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    // uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
    // https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
    // crossSubDomainCookies: {
    //   enabled: true,
    //   domain: "<your-workers-subdomain>",
    // },
  },

  plugins: authPlugins,
});
