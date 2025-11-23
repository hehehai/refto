"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import {
  type SignInOtpFormData,
  signInOtpSchema,
} from "@/lib/validations/auth";

interface SigninEmailOtpProps {
  onSubmit: (data: SignInOtpFormData) => void;
  submitButton?: React.ReactNode;
  modeButtons?: React.ReactNode;
}

export const SigninEmailOtp = ({
  onSubmit,
  submitButton,
  modeButtons,
}: SigninEmailOtpProps) => {
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);

  const form = useForm<SignInOtpFormData>({
    resolver: zodResolver(signInOtpSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  const emailValue = form.watch("email");

  const handleSendOtp = async () => {
    const email = form.getValues("email");
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    setSending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (error) {
        toast.error(error.message || "Failed to send verification code");
      } else {
        setOtpSent(true);
        toast.success("Verification code sent to your email");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send verification code"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Email</FormLabel>
              <FormControl>
                <Input
                  disabled={otpSent}
                  placeholder="Email"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {otpSent ? (
          <>
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Verification Code</FormLabel>
                  <FormControl>
                    <InputOTP
                      disabled={emailValue === ""}
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      render={({ slots }) => (
                        <>
                          <InputOTPGroup className="grow">
                            {slots[0] && (
                              <InputOTPSlot className="grow" {...slots[0]} />
                            )}
                            {slots[1] && (
                              <InputOTPSlot className="grow" {...slots[1]} />
                            )}
                            {slots[2] && (
                              <InputOTPSlot className="grow" {...slots[2]} />
                            )}
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup className="grow">
                            {slots[3] && (
                              <InputOTPSlot className="grow" {...slots[3]} />
                            )}
                            {slots[4] && (
                              <InputOTPSlot className="grow" {...slots[4]} />
                            )}
                            {slots[5] && (
                              <InputOTPSlot className="grow" {...slots[5]} />
                            )}
                          </InputOTPGroup>
                        </>
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {submitButton}
          </>
        ) : (
          <Button
            className="w-full"
            disabled={!emailValue || sending}
            onClick={handleSendOtp}
            type="button"
            variant="outline"
          >
            {sending ? "Sending..." : "Send Verification Code"}
          </Button>
        )}

        {modeButtons}
      </form>
    </Form>
  );
};
