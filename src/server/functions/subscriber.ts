"use server";

import crypto from "node:crypto";
import { verifyEmail } from "@devmehq/email-validator-js";
import { eq } from "drizzle-orm";

import { db, subscriber } from "@/db";
import { env } from "@/env";

// 订阅
export async function subscribe(email: string) {
  const { validFormat, validMx } = await verifyEmail({
    emailAddress: email,
    verifyMx: true,
    timeout: 10_000,
    debug: env.NODE_ENV !== "production",
  });

  if (!(validFormat && validMx)) {
    throw new Error("Invalid email address");
  }

  const existingSubscriber = await db.query.subscriber.findFirst({
    where: eq(subscriber.email, email),
  });

  if (!existingSubscriber) {
    const unSubSign = crypto.randomInt(100_000, 999_999).toString();
    const id = crypto.randomUUID();

    const [newSubscriber] = await db
      .insert(subscriber)
      .values({
        id,
        email,
        locale: "en",
        unSubSign,
      })
      .returning();

    return newSubscriber;
  }

  if (existingSubscriber?.unSubDate) {
    const [updated] = await db
      .update(subscriber)
      .set({
        locale: "en",
        unSubDate: null,
        updatedAt: new Date(),
      })
      .where(eq(subscriber.id, existingSubscriber.id))
      .returning();

    return updated;
  }

  throw new Error("Subscriber already subscribed");
}

// 取消订阅
export async function unsubscribe({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const existingSubscriber = await db.query.subscriber.findFirst({
    where: eq(subscriber.email, email),
  });

  if (!existingSubscriber) {
    throw new Error("Subscriber not found");
  }
  if (existingSubscriber?.unSubDate) {
    return true;
  }
  if (existingSubscriber.unSubSign !== token) {
    throw new Error("Token not match");
  }

  await db
    .update(subscriber)
    .set({
      unSubDate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriber.id, existingSubscriber.id));

  return true;
}
