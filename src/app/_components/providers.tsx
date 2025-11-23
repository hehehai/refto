"use client";

import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "next-themes";
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
        <ORPCReactProvider>{children}</ORPCReactProvider>
        <Toaster />
      </ThemeProvider>
    </JotaiProvider>
  );
}
