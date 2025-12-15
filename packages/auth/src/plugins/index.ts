import { UserRole } from "@refto-one/common";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { emailOtpPlugin } from "./email-otp";
import { magicLinkPlugin } from "./magic-link";

export const authPlugins = [
  emailOtpPlugin,
  magicLinkPlugin,
  admin({
    defaultRole: UserRole.USER,
    adminRoles: [UserRole.ADMIN],
  }),
  // Must be last plugin
  tanstackStartCookies(),
];
