"use client";

import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/shared/icons";

const unSubSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Email is invalid" }),
  token: z.string().min(1, { message: "Token is required" }),
});

export default function UnSubPage({
  searchParams,
}: {
  searchParams: { email: string; token: string };
}) {
  const { toast } = useToast();
  const valid = unSubSchema.safeParse(searchParams);

  const ubSubAction = api.subscriber.unsubscribe.useMutation({
    onSuccess: () => {
      toast({
        title: "You are Unsubscribe",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container flex min-h-[460px] max-w-lg flex-col items-center justify-center">
      <h3 className="mb-5 text-2xl">Unsubscribe Email</h3>
      {!valid.success ? (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Invalid email</AlertDescription>
        </Alert>
      ) : (
        <div className="w-full rounded-xl border border-zinc-100 p-5">
          <div className="text-xl">Email: {valid.data.email}</div>
          <div className="mt-2 text-xl">Token: {valid.data.token}</div>
          <Button
            className="mt-10 w-full"
            disabled={ubSubAction.isLoading}
            onClick={() => ubSubAction.mutate(valid.data)}
          >
            {ubSubAction.isLoading && <Spinner className="mr-2" />}
            <span>Confirm Unsubscribe</span>
          </Button>
        </div>
      )}
    </div>
  );
}
