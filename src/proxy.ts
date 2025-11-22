// import { getToken } from "next-auth/jwt";

import type { NextFetchEvent, NextRequest } from "next/server";
import { type NextRequestWithAuth, withAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

// const publicPages = ["/", "/*", "/login", "/register"];
const protectionPages = ["/panel"];

const intlMiddleware = createIntlMiddleware(routing);

const authMiddleware = withAuth(
  async function onSuccess(req) {
    return intlMiddleware(req as unknown as NextRequest);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  const protectionPathnameRegex = new RegExp(
    `^(/(${routing.locales.join("|")}))?(${protectionPages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?$`,
    "i"
  );

  const isProtectionPage = protectionPathnameRegex.test(req.nextUrl.pathname);

  if (!isProtectionPage) {
    return intlMiddleware(req);
  }
  return authMiddleware(req as unknown as NextRequestWithAuth, event as any);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
