import {
  adminClient,
  emailOTPClient,
  magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  plugins: [emailOTPClient(), magicLinkClient(), adminClient()],
});

export const { signIn, signUp, signOut, useSession, emailOtp, admin } =
  authClient;
