import { magicLink } from "better-auth/plugins/magic-link";
import { eq } from "drizzle-orm";
import { site } from "@/lib/config/site";
import { db, user } from "@/lib/db/index";
import { sendEmail } from "@/lib/email";
import { MagicLinkEmail } from "@/lib/email/templates/auth";
import { getBaseUrl } from "@/lib/utils";

export const magicLinkPlugin = magicLink({
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
