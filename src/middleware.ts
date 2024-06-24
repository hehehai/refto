// import { getToken } from "next-auth/jwt";
import { type NextRequestWithAuth, withAuth } from 'next-auth/middleware'
import createIntlMiddleware from 'next-intl/middleware'
import type { NextFetchEvent, NextRequest } from 'next/server'

import { i18n } from './i18n'

// const publicPages = ["/", "/*", "/login", "/register"];
const protectionPages = ['/panel']

const intlMiddleware = createIntlMiddleware({
  locales: i18n.locales,
  defaultLocale: i18n.defaultLocale,
  localePrefix: 'as-needed',
})

const authMiddleware = withAuth(
  async function onSuccess(req) {
    return intlMiddleware(req as unknown as NextRequest)
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token
      },
    },
  },
)

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const protectionPathnameRegex = RegExp(
    `^(/(${i18n.locales.join('|')}))?(${protectionPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i',
  )

  const isProtectionPage = protectionPathnameRegex.test(req.nextUrl.pathname)

  if (!isProtectionPage) {
    return intlMiddleware(req)
  }
  return authMiddleware(req as unknown as NextRequestWithAuth, event as any)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
