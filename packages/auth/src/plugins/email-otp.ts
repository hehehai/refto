import { verifyEmail } from "@devmehq/email-validator-js";
import { getBaseUrl, site } from "@refto-one/config";
import { db } from "@refto-one/db";
import { user } from "@refto-one/db/schema/auth";
import { sendEmail } from "@refto-one/email";
import {
  ResetPasswordEmail,
  VerificationEmail,
} from "@refto-one/email/templates/auth";
import { emailOTP } from "better-auth/plugins/email-otp";
import { eq } from "drizzle-orm";

export const emailOtpPlugin = emailOTP({
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

      const isPasswordReset = type === "forget-password";
      const [name = email] = email.split("@");
      const userName = existingUser?.name || name;

      if (process.env.NODE_ENV === "development") {
        console.log("sendVerificationOTP", {
          email,
          otp,
          type,
        });
      }

      if (isPasswordReset) {
        // Password reset email
        const verifyUrl = `${getBaseUrl()}/reset-password?email=${encodeURIComponent(email)}&token=${otp}`;

        await sendEmail({
          to: email,
          subject: `${site.name} | Reset your password`,
          renderData: ResetPasswordEmail({
            name: userName,
            verifyUrl,
            verifyCode: otp,
            baseUrl: getBaseUrl(),
          }),
        });
      } else {
        // Verification email (sign-in, sign-up, email-verification)
        const sendTitle = existingUser ? "Sign in" : "Sign up";
        const verifyUrl = `${getBaseUrl()}/verify-email?email=${encodeURIComponent(email)}&token=${otp}`;

        await sendEmail({
          to: email,
          subject: `${site.name} ${sendTitle} | Verify your email`,
          renderData: VerificationEmail({
            name: userName,
            verifyUrl,
            verifyCode: otp,
            baseUrl: getBaseUrl(),
          }),
        });
      }
    } catch (err) {
      console.error("[Email] Error sending OTP:", err);
      throw new Error("Error sending verification email");
    }
  },
  otpLength: 6,
  expiresIn: 600, // 10 minutes
  sendVerificationOnSignUp: true,
});
