import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { emailOtpPlugin } from "./email-otp";
import { magicLinkPlugin } from "./magic-link";

export const authPlugins = [
  emailOtpPlugin,
  magicLinkPlugin,
  admin({
    defaultRole: "USER",
    adminRoles: ["ADMIN"],
  }),
  // Must be last plugin
  nextCookies(),
];
