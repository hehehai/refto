"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/orpc/client";

// Schema for users with existing password
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Schema for users without password (OAuth users)
const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

export function PasswordCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has credential account (has password)
  const { data: hasPassword, isLoading: isCheckingPassword } = useQuery({
    queryKey: ["hasPassword"],
    queryFn: async () => {
      const { data: accounts } = await authClient.listAccounts();
      return (
        accounts?.some((account) => account.providerId === "credential") ??
        false
      );
    },
  });

  const changeForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const setForm = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onChangePassword = useCallback(
    async (values: ChangePasswordFormValues) => {
      setIsLoading(true);
      try {
        const { error } = await authClient.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          revokeOtherSessions: true,
        });

        if (error) {
          toast.error(error.message || "Failed to change password");
          return;
        }

        toast.success("Password changed successfully");
        changeForm.reset();
        setIsOpen(false);
      } catch (_err) {
        toast.error("Failed to change password");
      } finally {
        setIsLoading(false);
      }
    },
    [changeForm]
  );

  const onSetPassword = useCallback(
    async (values: SetPasswordFormValues) => {
      setIsLoading(true);
      try {
        await client.user.setPassword({ newPassword: values.newPassword });
        toast.success("Password set successfully");
        setForm.reset();
        setIsOpen(false);
        // Refetch to update hasPassword state
        window.location.reload();
      } catch (_err) {
        toast.error("Failed to set password");
      } finally {
        setIsLoading(false);
      }
    },
    [setForm]
  );

  return (
    <Collapsible
      className="rounded-lg border bg-card text-card-foreground shadow-sm"
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between p-6">
          <div>
            <h3 className="flex items-center gap-2 font-semibold leading-none tracking-tight">
              Password
              {!(isCheckingPassword || hasPassword) && (
                <Badge variant="secondary">Setup Required</Badge>
              )}
            </h3>
            <p className="mt-1.5 text-muted-foreground text-sm">
              {hasPassword
                ? "Change your password"
                : "Set up a password for your account"}
            </p>
          </div>
          <ChevronDownIcon
            className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t px-6 pt-4 pb-6">
          {isCheckingPassword ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : hasPassword ? (
            // Change password form (for users with existing password)
            <Form {...changeForm}>
              <form
                className="space-y-4"
                onSubmit={changeForm.handleSubmit(onChangePassword)}
              >
                <FormField
                  control={changeForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter current password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={changeForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter new password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={changeForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Confirm new password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button disabled={isLoading} type="submit">
                  {isLoading && <Spinner className="mr-2" />}
                  Change Password
                </Button>
              </form>
            </Form>
          ) : (
            // Set password form (for OAuth users without password)
            <Form {...setForm}>
              <form
                className="space-y-4"
                onSubmit={setForm.handleSubmit(onSetPassword)}
              >
                <p className="text-muted-foreground text-sm">
                  You signed up using a social account. Set a password to enable
                  email login.
                </p>

                <FormField
                  control={setForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={setForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Confirm password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button disabled={isLoading} type="submit">
                  {isLoading && <Spinner className="mr-2" />}
                  Set Password
                </Button>
              </form>
            </Form>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
