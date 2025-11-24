"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { signInModeParsers } from "@/lib/search-params";
import type {
  SignInEmailFormData,
  SignInOtpFormData,
  SignInPasswordFormData,
} from "@/lib/validations/auth";
import { SigninEmail } from "./signin-email";
import { SigninEmailOtp } from "./signin-email-otp";
import { SigninEmailPassword } from "./signin-email-password";
import { SigninThirdAuth } from "./signin-third-auth";

export const SignIn = () => {
  const router = useRouter();
  const [mode] = useQueryState("mode", signInModeParsers.mode);
  const [isPending, setIsPending] = useState(false);

  const handleEmailSubmit = async (data: SignInEmailFormData) => {
    setIsPending(true);
    try {
      const { error } = await authClient.signIn.magicLink({
        email: data.email,
        callbackURL: "/",
      });
      if (error) {
        toast.error(error.message || "Failed to send magic link");
      } else {
        toast.success("Check your email for the magic link!");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send magic link"
      );
    } finally {
      setIsPending(false);
    }
  };

  const handlePasswordSubmit = async (data: SignInPasswordFormData) => {
    setIsPending(true);
    try {
      const response = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
      if (response.error) {
        toast.error(
          response.error.message ||
            (response.error as { statusText?: string }).statusText ||
            "Invalid email or password"
        );
        return;
      }
      if (
        (response.data as { twoFactorRedirect?: boolean })?.twoFactorRedirect
      ) {
        toast.info("Two-factor authentication required");
        return;
      }
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsPending(false);
    }
  };

  const handleOtpSubmit = async (data: SignInOtpFormData) => {
    if (data.otp) {
      setIsPending(true);
      try {
        const { error } = await authClient.signIn.emailOtp({
          email: data.email,
          otp: data.otp,
        });
        if (error) {
          toast.error(error.message || "Failed to verify OTP");
        } else {
          router.push("/");
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to verify OTP"
        );
      } finally {
        setIsPending(false);
      }
    }
  };

  const signinMap = {
    email: {
      label: "Magic Link",
      onSubmit: handleEmailSubmit,
      submitLabel: "Send Magic Link",
    },
    "email-otp": {
      label: "Email OTP",
      onSubmit: handleOtpSubmit,
      submitLabel: "Verify",
    },
    password: {
      label: "Password",
      onSubmit: handlePasswordSubmit,
      submitLabel: "Sign In",
    },
  };

  const activeMode = signinMap[mode];
  const otherModes = (Object.keys(signinMap) as Array<keyof typeof signinMap>)
    .filter((key) => key !== mode)
    .map((key) => ({ key, ...signinMap[key] }));

  const modeButtons = (
    <div className="flex items-center justify-center gap-3">
      {otherModes.map((modeItem) => (
        <Button asChild className="grow" key={modeItem.key} variant="secondary">
          <Link href={`/signin?mode=${modeItem.key}`}>{modeItem.label}</Link>
        </Button>
      ))}
    </div>
  );

  const submitButton = (
    <Button className="w-full" disabled={isPending} type="submit">
      {isPending ? "Processing..." : activeMode.submitLabel}
    </Button>
  );

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
        <h1 className="mb-1 text-2xl">Sign In</h1>
        <p className="mb-8 text-secondary-foreground">
          View all website information
        </p>
      </header>

      {mode === "email" && (
        <SigninEmail onSubmit={handleEmailSubmit}>
          {submitButton}
          {modeButtons}
        </SigninEmail>
      )}

      {mode === "email-otp" && (
        <SigninEmailOtp
          modeButtons={modeButtons}
          onSubmit={handleOtpSubmit}
          submitButton={submitButton}
        />
      )}

      {mode === "password" && (
        <SigninEmailPassword onSubmit={handlePasswordSubmit}>
          {submitButton}
          {modeButtons}
        </SigninEmailPassword>
      )}

      <SigninThirdAuth />
      <footer className="mt-10">
        <p className="mb-2 text-secondary-foreground text-sm">
          <Link
            className="text-foreground hover:underline"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </p>
        <p className="text-secondary-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link className="text-foreground hover:underline" href="/signup">
            Sign up
          </Link>
        </p>
      </footer>
    </div>
  );
};
