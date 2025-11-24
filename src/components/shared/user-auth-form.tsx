"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type * as z from "zod";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { emailOtp } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { userAuthSchema } from "@/lib/validations/auth";
import { Spinner } from "./icons";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  isLogin: boolean;
}

type FormData = z.infer<typeof userAuthSchema>;

export function UserAuthForm({
  isLogin,
  className,
  ...props
}: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();
  const [showOtpForm, setShowOtpForm] = React.useState<boolean>(false);

  const otpInputRef = React.useRef<HTMLInputElement>(null);
  const [otpValue, setOtpValue] = React.useState<string>("");
  const [otpLoading, setOtpLoading] = React.useState<boolean>(false);

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      const { error } = await emailOtp.sendVerificationOtp({
        email: data.email.toLowerCase(),
        type: "sign-in",
      });

      setIsLoading(false);

      if (error) {
        toast.error(error.message || "Something went wrong", {
          description: "Failed to send verification code",
        });
        return;
      }

      setOtpValue("");
      setShowOtpForm(true);

      toast.success("Check your email for the verification code", {
        description: "Verification code sent",
      });

      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 20);
    } catch (err) {
      setIsLoading(false);
      console.error("Send OTP error:", err);
      toast.error("Something went wrong", {
        description: "Failed to send verification code",
      });
    }
  }

  const handleVerifyOtp = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault?.();

    try {
      setOtpLoading(true);
      const { email } = getValues();

      const { error } = await emailOtp.verifyEmail({
        email: email.toLowerCase(),
        otp: otpValue,
      });

      if (error) {
        setOtpLoading(false);
        toast.error(error.message || "Invalid verification code", {
          description: "Verification failed",
        });
        setTimeout(() => {
          otpInputRef.current?.focus();
        }, 20);
        return;
      }

      setOtpLoading(false);
      toast.success("Successfully signed in!");
      router.replace(searchParams?.get("from")?.trim() || "/");
      router.refresh();
    } catch (err) {
      console.error("OTP verification error:", err);
      setOtpLoading(false);
      toast.error("Invalid verification code", {
        description: "Verification failed",
      });
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {showOtpForm ? (
        <form onSubmit={handleVerifyOtp}>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="otp">
                Verification Code
              </Label>
              <InputOTP
                className="w-full"
                disabled={otpLoading}
                maxLength={6}
                onChange={setOtpValue}
                onComplete={handleVerifyOtp}
                pattern={REGEXP_ONLY_DIGITS}
                ref={otpInputRef}
                render={({ slots }) => (
                  <>
                    <InputOTPGroup>
                      {slots.slice(0, 3).map((slot, index) => (
                        <InputOTPSlot key={index as React.Key} {...slot} />
                      ))}{" "}
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      {slots.slice(3).map((slot, index) => (
                        <InputOTPSlot
                          key={(index + 3) as React.Key}
                          {...slot}
                        />
                      ))}
                    </InputOTPGroup>
                  </>
                )}
                value={otpValue}
              />
            </div>
            <button
              className={cn(buttonVariants({ variant: "secondary" }))}
              disabled={otpLoading}
              onClick={() => {
                setOtpValue("");
                setShowOtpForm(false);
              }}
              type="button"
            >
              {otpLoading ? (
                <Spinner className="mr-2" />
              ) : (
                <span className="i-lucide-arrow-left mr-2" />
              )}
              <span>Try another email</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <Input
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                id="email"
                placeholder="name@example.com"
                type="email"
                {...register("email")}
              />
              {errors?.email && (
                <p className="px-1 text-red-600 text-xs">
                  {errors.email.message}
                </p>
              )}
            </div>
            <button
              className={cn(buttonVariants())}
              disabled={isLoading}
              type="submit"
            >
              {isLoading && <Spinner className="mr-2" />}
              {isLogin ? "Sign In with Email" : "Sign Up with Email"}
            </button>
          </div>
        </form>
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
    </div>
  );
}
