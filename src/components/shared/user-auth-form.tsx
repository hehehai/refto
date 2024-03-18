"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { cn } from "@/lib/utils";
import { userAuthSchema } from "@/lib/validations/auth";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Spinner } from "./icons";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type FormData = z.infer<typeof userAuthSchema>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
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

  const optInputRef = React.useRef<HTMLInputElement>(null);
  const [optValue, setOptValue] = React.useState<string>("");
  const [optLoading, setOptLoading] = React.useState<boolean>(false);

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    const signInResult = await signIn("email", {
      email: data.email.toLowerCase(),
      redirect: false,
    });

    setIsLoading(false);

    if (signInResult?.error) {
      return toast({
        title: "Something went wrong.",
        description: "Your sign in request failed. Please try again.",
        variant: "destructive",
      });
    }

    setOptValue("");
    setShowOtpForm(true);

    toast({
      title: "Check your email",
      description: "We sent you a login link. Be sure to check your spam too.",
    });

    setTimeout(() => {
      optInputRef.current?.focus();
    }, 20);
  }

  const handleVerifyOtp = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault?.();

    try {
      setOptLoading(true);
      const { email } = getValues();

      const res = await fetch(
        `/api/auth/callback/email?email=${encodeURIComponent(email)}&token=${optValue}`,
      );
      if (res.status !== 200) {
        setOptLoading(false);
        toast({
          title: "Validation failed.",
          description: "Please try again.",
          variant: "destructive",
        });
        setTimeout(() => {
          optInputRef.current?.focus();
        }, 20);
        return;
      }

      setOptLoading(false);
      toast({ title: "Verified Success" });
      router.replace(searchParams?.get("from")?.trim() || "/");
    } catch (err) {
      console.log("OTP err", err);
    } finally {
      setOptLoading(false);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {showOtpForm ? (
        <form onSubmit={handleVerifyOtp}>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="otp">
                Email OTP token
              </Label>
              <InputOTP
                maxLength={6}
                disabled={optLoading}
                onComplete={handleVerifyOtp}
                ref={optInputRef}
                value={optValue}
                onChange={setOptValue}
                pattern={REGEXP_ONLY_DIGITS}
                className="w-full"
                render={({ slots }) => (
                  <>
                    <InputOTPGroup>
                      {slots.slice(0, 3).map((slot, index) => (
                        <InputOTPSlot key={index} {...slot} />
                      ))}{" "}
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      {slots.slice(3).map((slot, index) => (
                        <InputOTPSlot key={index + 3} {...slot} />
                      ))}
                    </InputOTPGroup>
                  </>
                )}
              />
            </div>
            <button
              className={cn(buttonVariants({ variant: "secondary" }))}
              disabled={optLoading}
              onClick={() => {
                setOptValue("");
                setShowOtpForm(false);
              }}
            >
              {optLoading ? (
                <Spinner className="mr-2" />
              ) : (
                <span className="i-lucide-arrow-left mr-2" />
              )}
              <span>Did not receive the message, resend</span>
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
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                {...register("email")}
              />
              {errors?.email && (
                <p className="px-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <button className={cn(buttonVariants())} disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              Sign In with Email
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
