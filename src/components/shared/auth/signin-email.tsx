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
  type SignInEmailFormData,
  signInEmailSchema,
} from "@/lib/validations/auth";

interface SigninEmailProps {
  onSubmit: (data: SignInEmailFormData) => void;
  children?: React.ReactNode;
}

export const SigninEmail = ({ onSubmit, children }: SigninEmailProps) => {
  const form = useForm<SignInEmailFormData>({
    resolver: zodResolver(signInEmailSchema),
    defaultValues: {
      email: "",
    },
  });

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
                <Input placeholder="Email" type="email" {...field} />
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
