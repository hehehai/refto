"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { ResetPasswordEmailFormData } from "@/lib/validations/auth";
import { ForgotPasswordEmail } from "./forgot-password-email";

export const ForgotPassword = () => {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleEmailSubmit = async (data: ResetPasswordEmailFormData) => {
    setEmail(data.email);
    setIsPending(true);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: data.email,
        type: "forget-password",
      });
      if (error) {
        toast.error(error.message || "Failed to send password reset code");
      } else {
        setEmailSent(true);
        toast.success("Password reset code sent to your email");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to send password reset code"
      );
    } finally {
      setIsPending(false);
    }
  };

  // Show email sent confirmation
  if (emailSent) {
    return (
      <div className="w-full max-w-sm">
        <header>
          <Image
            alt="Logo"
            className="mb-3 size-10"
            height={60}
            src="/images/logo.svg"
            width={60}
          />
          <h1 className="mb-1 text-2xl">Check your email</h1>
          <p className="mb-8 text-secondary-foreground">
            We&apos;ve sent a password reset code to {email}. Please check your
            inbox and use the code to reset your password.
          </p>
        </header>
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => router.push("/signin?mode=email-otp")}
          >
            Go to Sign In
          </Button>
          <Button
            className="w-full"
            onClick={() => setEmailSent(false)}
            variant="secondary"
          >
            Send again
          </Button>
        </div>
        <footer className="mt-10">
          <p className="text-secondary-foreground text-sm">
            Remember your password?{" "}
            <Link className="text-foreground hover:underline" href="/signin">
              Sign in
            </Link>
          </p>
        </footer>
      </div>
    );
  }

  // Show email input form
  return (
    <div className="w-full max-w-sm">
      <header>
        <Image
          alt="Logo"
          className="mb-3 size-10"
          height={60}
          src="/images/logo.svg"
          width={60}
        />
        <h1 className="mb-1 text-2xl">Forgot Password</h1>
        <p className="mb-8 text-secondary-foreground">
          Enter your email address and we&apos;ll send you a code to reset your
          password
        </p>
      </header>
      <ForgotPasswordEmail onSubmit={handleEmailSubmit}>
        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Sending..." : "Send reset code"}
        </Button>
      </ForgotPasswordEmail>
      <footer className="mt-10">
        <p className="text-secondary-foreground text-sm">
          Remember your password?{" "}
          <Link className="text-foreground hover:underline" href="/signin">
            Sign in
          </Link>
        </p>
      </footer>
    </div>
  );
};
