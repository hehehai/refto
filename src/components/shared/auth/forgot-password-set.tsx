"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  type ResetPasswordSetFormData,
  resetPasswordSetSchema,
} from "@/lib/validations/auth";

interface ForgotPasswordSetProps {
  onSubmit: (data: ResetPasswordSetFormData) => void;
  children?: React.ReactNode;
}

export const ForgotPasswordSet = ({
  onSubmit,
  children,
}: ForgotPasswordSetProps) => {
  const form = useForm<ResetPasswordSetFormData>({
    resolver: zodResolver(resetPasswordSetSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">New password</FormLabel>
              <FormControl>
                <Input
                  autoComplete="new-password"
                  placeholder="New password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Confirm new password</FormLabel>
              <FormControl>
                <Input
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  );
};
