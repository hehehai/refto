'use client'

import { Toaster } from '@/components/ui/toaster'
import { TRPCReactProvider } from '@/lib/trpc/react'
import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={true}>
      <TRPCReactProvider>{children}</TRPCReactProvider>
      <Toaster />
    </SessionProvider>
  )
}
