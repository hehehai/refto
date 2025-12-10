"use server";

import { eq } from "drizzle-orm";

import { db, weekly } from "@/lib/db";

export async function detail(id: string) {
  return db.query.weekly.findFirst({
    where: eq(weekly.id, id),
  });
}
