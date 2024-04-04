import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  return session?.user;
}

export const getSession = async () => {
  return getServerSession(authOptions);
};
