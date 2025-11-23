import { verifyEmail } from "@devmehq/email-validator-js";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";
import { magicLink } from "better-auth/plugins/magic-link";
import { eq } from "drizzle-orm";

import { db, user } from "@/db";
import { env } from "@/env";
import { site } from "@/lib/config/site";
import { sendEmail } from "@/lib/email";
import UserAuthEmail from "@/lib/email/templates/auth";
import { getBaseUrl } from "@/lib/utils";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  socialProviders: {
    ...(env.GITHUB_CLIENT_ID &&
      env.GITHUB_CLIENT_SECRET && {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      }),
    ...(env.GOOGLE_CLIENT_ID &&
      env.GOOGLE_CLIENT_SECRET && {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }),
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        input: false,
      },
    },
    modelName: "user",
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

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        try {
          // Check if user exists
          const existingUser = await db.query.user.findFirst({
            where: eq(user.email, email),
            columns: { emailVerified: true, name: true },
          });

          // For new users, verify email MX records
          if (!existingUser) {
            const { validFormat, validMx } = await verifyEmail({
              emailAddress: email,
              verifyMx: true,
              timeout: 10_000,
            });

            if (!(validFormat && validMx)) {
              throw new Error("Invalid email address");
            }
          }

          const sendTitle = existingUser ? "Sign in" : "Sign up";
          const [name = email] = email.split("@");

          if (process.env.NODE_ENV === "development") {
            console.log("sendVerificationOTP", {
              sendTitle,
              email,
              otp,
              type,
            });
          }

          const verifyUrl = `${getBaseUrl()}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${otp}`;

          await sendEmail({
            to: email,
            subject: `${site.name} ${sendTitle} | Verify your email`,
            renderData: UserAuthEmail({
              name: existingUser?.name || name,
              verifyUrl,
              verifyCode: otp,
              baseUrl: getBaseUrl(),
            }),
          });
        } catch (err) {
          console.error("[Email] Error sending OTP:", err);
          throw new Error("Error sending verification email");
        }
      },
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      sendVerificationOnSignUp: true,
    }),

    magicLink({
      async sendMagicLink({ email, url }) {
        try {
          const existingUser = await db.query.user.findFirst({
            where: eq(user.email, email),
            columns: { name: true },
          });

          const [name = email] = email.split("@");

          if (process.env.NODE_ENV === "development") {
            console.log("sendMagicLink", { email, url });
          }

          await sendEmail({
            to: email,
            subject: `${site.name} | Magic Link Sign In`,
            renderData: UserAuthEmail({
              name: existingUser?.name || name,
              verifyUrl: url,
              verifyCode: "",
              baseUrl: getBaseUrl(),
            }),
          });
        } catch (err) {
          console.error("[Email] Error sending magic link:", err);
          throw new Error("Error sending magic link email");
        }
      },
      expiresIn: 600, // 10 minutes
    }),

    admin({
      defaultRole: "USER",
      adminRoles: ["ADMIN"],
    }),

    // Must be last plugin
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session & {
  user: typeof auth.$Infer.Session.user & {
    role?: string;
  };
};
export type User = Session["user"];
