"use server";

import { db } from "@/lib/db";
import crypto from "node:crypto";
import { verifyEmail } from "@devmehq/email-validator-js";
import { env } from "@/env";

// 订阅
export async function subscribe(email: string) {
  const { validFormat, validSmtp, validMx } = await verifyEmail({
    emailAddress: email,
    verifySmtp: true,
    verifyMx: true,
    timeout: 5000,
    debug: env.NODE_ENV !== "production",
  });

  if (!validFormat || !validSmtp || !validMx) {
    throw new Error("Invalid email address");
  }

  const subscriber = await db.subscriber.findUnique({
    where: {
      email,
    },
  });

  if (!subscriber) {
    const unSubSign = crypto.randomInt(100000, 999999).toString();

    return await db.subscriber.create({
      data: {
        email,
        unSubSign,
      },
    });
  }

  if (subscriber?.unSubDate) {
    return db.subscriber.update({
      where: {
        id: subscriber.id,
      },
      data: {
        unSubDate: null,
      },
    });
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
  const subscriber = await db.subscriber.findUnique({
    where: {
      email,
    },
  });
  if (!subscriber) {
    throw new Error("Subscriber not found");
  }
  if (subscriber?.unSubDate) {
    return true;
  }
  if (subscriber.unSubSign !== token) {
    throw new Error("Token not match");
  }
  await db.subscriber.update({
    where: {
      id: subscriber.id,
    },
    data: {
      unSubDate: new Date(),
    },
  });
  return true;
}
