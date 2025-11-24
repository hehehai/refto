import type { Metadata } from "next";
import { VerifyEmailInvalid } from "@/components/shared/auth/verify-email-invalid";
import { VerifyEmailSuccess } from "@/components/shared/auth/verify-email-success";
import { auth } from "@/lib/auth/config";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};

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
