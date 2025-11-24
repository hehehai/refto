import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/shared/auth/reset-password-form";
import { ResetPasswordInvalid } from "@/components/shared/auth/reset-password-invalid";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email, token } = await searchParams;

  // Validate required params - OTP validation happens on form submit
  if (!(email && token)) {
    return <ResetPasswordInvalid />;
  }

  // Render the password reset form - OTP will be validated when user submits
  return <ResetPasswordForm email={email} token={token} />;
}
