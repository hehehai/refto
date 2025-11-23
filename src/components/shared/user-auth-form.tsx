"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
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
import { toast } from "@/components/ui/use-toast";
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
  const t = useTranslations("Auth");
  const tSpace = `${isLogin ? "login" : "register"}`;
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
        return toast({
          title: t("status.error.title"),
          description: error.message || t("status.error.description"),
          variant: "destructive",
        });
      }

      setOtpValue("");
      setShowOtpForm(true);

      toast({
        title: t("status.success.title"),
        description: t("status.success.description"),
      });

      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 20);
    } catch (err) {
      setIsLoading(false);
      console.error("Send OTP error:", err);
      toast({
        title: t("status.error.title"),
        description: t("status.error.description"),
        variant: "destructive",
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
        toast({
          title: t("otp.error.title"),
          description: error.message || t("otp.error.description"),
          variant: "destructive",
        });
        setTimeout(() => {
          otpInputRef.current?.focus();
        }, 20);
        return;
      }

      setOtpLoading(false);
      toast({ title: t("otp.success.title") });
      router.replace(searchParams?.get("from")?.trim() || "/");
      router.refresh();
    } catch (err) {
      console.error("OTP verification error:", err);
      setOtpLoading(false);
      toast({
        title: t("otp.error.title"),
        description: t("otp.error.description"),
        variant: "destructive",
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
                {t("otp.title")}
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
              <span>{t("otp.try")}</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                {t(`${tSpace}.label`)}
              </Label>
              <Input
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                id="email"
                placeholder={t(`${tSpace}.m1`)}
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
              {t(`${tSpace}.button`)}
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
            {t(`${tSpace}.or`)}
          </span>
        </div>
      </div>
    </div>
  );
}
