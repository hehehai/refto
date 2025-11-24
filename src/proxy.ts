import { getSessionCookie } from "better-auth/cookies";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectionPages = ["/panel"];

export default async function proxy(req: NextRequest, _event: NextFetchEvent) {
  const protectionPathnameRegex = new RegExp(
    `^(${protectionPages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?`,
    "i"
  );

  const isProtectionPage = protectionPathnameRegex.test(req.nextUrl.pathname);

  if (!isProtectionPage) {
    return NextResponse.next();
  }

  // For protected pages, check if user has a session cookie
  // Better Auth uses a session token cookie
  const sessionCookie = getSessionCookie(req);

  if (!sessionCookie) {
    // Redirect to login page if no session
    const loginUrl = new URL("/signin", req.url);
    loginUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User has session cookie, proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel"],
};
