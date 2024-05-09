"use client";

import { type ReactNode } from "react";
import { TRPCReactProvider } from "@/lib/trpc/react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={true}>
      <TRPCReactProvider>{children}</TRPCReactProvider>
      <Toaster />
    </SessionProvider>
  );
}
