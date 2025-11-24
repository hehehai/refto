import type { Metadata } from "next";
import { SignUp } from "@/components/shared/auth/signup";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

export default function SignUpPage() {
  return <SignUp />;
}
