import { getBaseUrl, site } from "@refto-one/common";
import { db } from "@refto-one/db";
import { user } from "@refto-one/db/schema/auth";
import { sendEmail } from "@refto-one/email";
import { MagicLinkEmail } from "@refto-one/email/templates/auth";
import { magicLink } from "better-auth/plugins/magic-link";
import { eq } from "drizzle-orm";

export const magicLinkPlugin = magicLink({
  async sendMagicLink({ email, url }) {
    try {
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
