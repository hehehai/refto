import { getBaseUrl, site } from "@refto-one/common";
import { createDb } from "@refto-one/db";
import { user } from "@refto-one/db/schema/auth";
import { magicLink } from "better-auth/plugins/magic-link";
import { eq } from "drizzle-orm";
import type { CloudflareEnv } from "../index";

export function createMagicLinkPlugin(env?: CloudflareEnv) {
  return magicLink({
    async sendMagicLink({ email, url }) {
      try {
        // Create a new db connection for each request (required for Cloudflare Workers)
        const db = createDb(env?.HYPERDRIVE?.connectionString);
        const existingUser = await db.query.user.findFirst({
          where: eq(user.email, email),
          columns: { name: true },
        });

        // Only send magic link if user exists (silent return to prevent email enumeration)
        if (!existingUser) {
          return;
        }

        const [name = email] = email.split("@");

        if (process.env.NODE_ENV === "development") {
          console.info("sendMagicLink", { email, url });
        }

        // Lazy load email dependencies to reduce initial bundle size
        const { sendEmail } = await import("@refto-one/email");
        const { MagicLinkEmail } = await import(
          "@refto-one/email/templates/auth"
        );

        await sendEmail({
          to: email,
          subject: `${site.name} | Sign In`,
          renderData: MagicLinkEmail({
            name: existingUser?.name || name,
            verifyUrl: url,
            baseUrl: getBaseUrl(),
          }),
        });
      } catch (err) {
        console.error("[Email] Error sending magic link:", err);
        throw new Error("Error sending magic link email");
      }
    },
    expiresIn: 600, // 10 minutes
  });
}

// Default export for backward compatibility
export const magicLinkPlugin = createMagicLinkPlugin();
