import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForgotPassword } from "@/components/shared/auth/forgot-password";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return {
    title: t("forgotPassword.title"),
    description: t("forgotPassword.description"),
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
