import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db, user } from "@/db";
import { auth } from "@/lib/auth";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
};

export type Session = {
  user: SessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
} | null;

export async function getSession(): Promise<Session> {
  const betterAuthSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!betterAuthSession?.user) {
    return null;
  }

  // Fetch user role from database since better-auth doesn't include it by default
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, betterAuthSession.user.id),
    columns: { role: true },
  });

  return {
    user: {
      id: betterAuthSession.user.id,
      name: betterAuthSession.user.name,
      email: betterAuthSession.user.email,
      image: betterAuthSession.user.image,
      role: dbUser?.role || "USER",
    },
    session: betterAuthSession.session,
  };
}

export async function getCurrentUser(): Promise<SessionUser | undefined> {
  const session = await getSession();
  return session?.user;
}
