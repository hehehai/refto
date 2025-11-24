"use client";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Spinner } from "@/components/shared/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc/react";

const unSubSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Email is invalid" }),
  token: z.string().min(1, { message: "Token is required" }),
});

export default function UnSubPage() {
  const searchParams = useSearchParams();
  const valid = unSubSchema.safeParse({
    email: searchParams.get("email") || "",
    token: searchParams.get("token") || "",
  });

  const ubSubAction = useMutation({
    ...orpc.subscriber.unsubscribe.mutationOptions(),
    onSuccess: () => {
      toast.success("You are Unsubscribe");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="container flex min-h-[460px] max-w-lg flex-col items-center justify-center">
      <h3 className="mb-5 text-2xl">Unsubscribe Email</h3>
      {valid.success ? (
        <div className="w-full rounded-xl border border-zinc-100 p-5">
          <div className="text-xl">Email: {valid.data.email}</div>
          <div className="mt-2 text-xl">Token: {valid.data.token}</div>
          <Button
            className="mt-10 w-full"
            disabled={ubSubAction.isPending}
            onClick={() => ubSubAction.mutate(valid.data)}
          >
            {ubSubAction.isPending && <Spinner className="mr-2" />}
            <span>Confirm Unsubscribe</span>
          </Button>
        </div>
      ) : (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {valid.error.issues[0]?.message || "Invalid data"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
