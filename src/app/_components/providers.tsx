'use client'

import { Toaster } from '@/components/ui/toaster'
import { TRPCReactProvider } from '@/lib/trpc/react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider refetchOnWindowFocus={true}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
      </SessionProvider>
    </ThemeProvider>
  )
}
