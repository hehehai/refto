import { type CloudflareEnv, createAuth } from "@refto-one/auth";
import { UserRole } from "@refto-one/common";
import { notFound, redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";

// Helper to get Cloudflare env bindings
// Returns undefined in non-Cloudflare environments
async function loadCloudflareEnv(): Promise<CloudflareEnv | undefined> {
  try {
    const cloudflareWorkers = await import("cloudflare:workers");
    return cloudflareWorkers.env as CloudflareEnv;
  } catch {
    return;
  }
}

// Cache the env getter promise
const envPromise = loadCloudflareEnv();

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const env = await envPromise;
    const auth = createAuth(env);
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      setResponseStatus(401);
      throw new Error("Unauthorized");
    }

    return next({
      context: { session },
    });
  }
);

export const authInterceptor = createMiddleware().server(
  async ({ next, request }) => {
    const env = await envPromise;
    const auth = createAuth(env);
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      throw redirect({ to: "/signin" });
    }

    return next({
      context: { session },
    });
  }
);

export const adminInterceptor = createMiddleware().server(
  async ({ next, request }) => {
    const env = await envPromise;
    const auth = createAuth(env);
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      throw redirect({ to: "/signin" });
    }

    if (session.user.role !== UserRole.ADMIN) {
      throw notFound();
    }

    return next({
      context: { session },
    });
  }
);
