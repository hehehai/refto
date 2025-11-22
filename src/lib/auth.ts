import crypto from "node:crypto";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { verifyEmail } from "@devmehq/email-validator-js";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { env } from "@/env";
import { db } from "@/lib/db";
import { site } from "./config/site";
import { sendEmail } from "./email";
import UserAuthEmail from "./email/templates/auth";
import { getBaseUrl } from "./utils";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db as any) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    EmailProvider({
      from: env.EMAIL_USER,
      generateVerificationToken: () => {
        // Generate a random 6-digit code (OTP)
        return crypto.randomInt(100_000, 999_999).toString();
      },
      sendVerificationRequest: async ({ identifier, url, token }) => {
        try {
          const user = await db.user.findUnique({
            where: {
              email: identifier,
            },
            select: {
              emailVerified: true,
            },
          });

          if (!user) {
            const { validFormat, validMx } = await verifyEmail({
              emailAddress: identifier,
              verifyMx: true,
              timeout: 10_000,
            });

            if (!(validFormat && validMx)) {
              throw new Error("Invalid email address");
            }
          }

          const sendTitle = user ? "Sign in" : "Sign up";

          if (process.env.NODE_ENV === "development") {
            console.log("sendVerificationRequest", {
              sendTitle,
              identifier,
              url,
            });
          }

          const [name = identifier] = identifier.split("@");

          await sendEmail({
            to: identifier,
            subject: `${site.name} ${sendTitle} | Verify your email`,
            renderData: UserAuthEmail({
              name,
              verifyUrl: url,
              verifyCode: token,
              baseUrl: getBaseUrl(),
            }),
          });

          return;
        } catch (err) {
          console.error("[Email] Error sending:", err);
          throw new Error("Error sending verification email");
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.image = token.picture;
      }

      return session;
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        picture: dbUser.image,
      };
    },
  },
};
