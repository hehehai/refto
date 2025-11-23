import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { VerifyEmailInvalid } from "@/components/shared/auth/verify-email-invalid";
import { VerifyEmailSuccess } from "@/components/shared/auth/verify-email-success";
import { auth } from "@/lib/auth/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return {
    title: t("verifyEmail.title"),
    description: t("verifyEmail.description"),
  };
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email, token } = await searchParams;

  // Validate required params
  if (!(email && token)) {
    return <VerifyEmailInvalid />;
  }

  try {
    // Server-side OTP verification
    const result = await auth.api.verifyEmail({
      query: {
        token,
      },
    });

    if (!result) {
      return <VerifyEmailInvalid email={email} />;
    }

    // Email verified successfully
    return <VerifyEmailSuccess />;
  } catch {
    // OTP verification failed
    return <VerifyEmailInvalid email={email} />;
  }
}
