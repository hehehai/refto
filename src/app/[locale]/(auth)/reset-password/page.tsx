import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/components/shared/auth/reset-password-form";
import { ResetPasswordInvalid } from "@/components/shared/auth/reset-password-invalid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return {
    title: t("resetPassword.title"),
    description: t("resetPassword.description"),
  };
}

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
