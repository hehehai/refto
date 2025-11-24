"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/shared/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

const deleteSchema = z.object({
  password: z.string().min(1, "Password is required to delete account"),
});

type DeleteFormValues = z.infer<typeof deleteSchema>;

export function DeleteAccountCard() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DeleteFormValues>({
    resolver: zodResolver(deleteSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleDelete = useCallback(async () => {
    const password = form.getValues("password");
    setIsLoading(true);
    try {
      const { error } = await authClient.deleteUser({
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to delete account");
        return;
      }

      toast.success("Account deleted successfully");
      router.push("/");
    } catch (_err) {
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  }, [form, router]);

  const onSubmit = useCallback((_values: DeleteFormValues) => {
    setShowConfirm(true);
  }, []);

  return (
    <>
      <Collapsible
        className="rounded-lg border border-destructive/50 bg-card text-card-foreground shadow-sm"
        onOpenChange={setIsOpen}
        open={isOpen}
      >
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between p-6">
            <div>
              <h3 className="font-semibold text-destructive leading-none tracking-tight">
                Delete Account
              </h3>
              <p className="mt-1.5 text-muted-foreground text-sm">
                Permanently delete your account and all data
              </p>
            </div>
            <ChevronDownIcon
              className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-destructive/50 border-t px-6 pt-4 pb-6">
            <p className="mb-4 text-muted-foreground text-sm">
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </p>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm your password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" variant="destructive">
                  Delete Account
                </Button>
              </form>
            </Form>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog onOpenChange={setShowConfirm} open={showConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
              onClick={handleDelete}
            >
              {isLoading && <Spinner className="mr-2" />}
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
