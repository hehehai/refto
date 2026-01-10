import { UserRole } from "@refto-one/common";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import type { CloudflareEnv } from "../index";
import { createEmailOtpPlugin } from "./email-otp";
import { createMagicLinkPlugin } from "./magic-link";

// Factory function to create auth plugins with optional env
export function createAuthPlugins(env?: CloudflareEnv) {
  return [
    createEmailOtpPlugin(env),
    createMagicLinkPlugin(env),
    admin({
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN],
    }),
    // Must be last plugin
    tanstackStartCookies(),
  ];
}

// Default export for backward compatibility
export const authPlugins = createAuthPlugins();
