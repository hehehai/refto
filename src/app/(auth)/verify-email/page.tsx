import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { VerifyEmailInvalid } from "@/components/shared/auth/verify-email-invalid";
import { VerifyEmailSuccess } from "@/components/shared/auth/verify-email-success";
import { auth } from "@/lib/auth/config";
import { emailVerificationParamsCache } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { email, token } =
    await emailVerificationParamsCache.parse(searchParams);

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
