"use client";

import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ORPCReactProvider } from "@/lib/orpc/react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableSystem
      >
        <NuqsAdapter>
          <ORPCReactProvider>{children}</ORPCReactProvider>
        </NuqsAdapter>
        <Toaster />
      </ThemeProvider>
    </JotaiProvider>
  );
}
