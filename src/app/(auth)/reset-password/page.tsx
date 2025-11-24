import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { ResetPasswordForm } from "@/components/shared/auth/reset-password-form";
import { ResetPasswordInvalid } from "@/components/shared/auth/reset-password-invalid";
import { emailVerificationParamsCache } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { email, token } =
    await emailVerificationParamsCache.parse(searchParams);

  // Validate required params - OTP validation happens on form submit
  if (!(email && token)) {
    return <ResetPasswordInvalid />;
  }

  // Render the password reset form - OTP will be validated when user submits
  return <ResetPasswordForm email={email} token={token} />;
}
