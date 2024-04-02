import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { type Session } from "next-auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  return session?.user;
}

export const getSession = async () => {
  return getServerSession(authOptions);
};
