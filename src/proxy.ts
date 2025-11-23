import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

const protectionPages = ["/panel"];

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(req: NextRequest, _event: NextFetchEvent) {
  const protectionPathnameRegex = new RegExp(
    `^(/(${routing.locales.join("|")}))?(${protectionPages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?`,
    "i"
  );

  const isProtectionPage = protectionPathnameRegex.test(req.nextUrl.pathname);

  if (!isProtectionPage) {
    return intlMiddleware(req);
  }

  // For protected pages, check if user has a session cookie
  // Better Auth uses a session token cookie
  const sessionCookie = req.cookies.get("better-auth.session_token");

  if (!sessionCookie?.value) {
    // Redirect to login page if no session
    const loginUrl = new URL("/signin", req.url);
    loginUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User has session cookie, proceed with intl middleware
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
