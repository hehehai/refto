import type { Metadata } from "next";
import { Suspense } from "react";
import { SignIn } from "@/components/shared/auth/signin";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

function SignInFallback() {
  return (
    <div className="w-full max-w-sm space-y-4">
      <Skeleton className="h-10 w-10" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-48" />
      <div className="space-y-3 pt-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignIn />
    </Suspense>
  );
}
