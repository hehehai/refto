import type { Metadata } from "next";
import { ForgotPassword } from "@/components/shared/auth/forgot-password";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
