import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";
import { ResetPasswordInvalid } from "@/components/features/auth/reset-password-invalid";

const searchSchema = z.object({
  token: z.string(),
  email: z.email(),
});

export const Route = createFileRoute("/(auth)/reset-password")({
  component: RouteComponent,
  validateSearch: searchSchema,
  errorComponent: ResetPasswordInvalid,
});

function RouteComponent() {
  const { token, email } = Route.useSearch();

  if (!(email && token)) {
    return <ResetPasswordInvalid />;
  }

  // Render the password reset form - OTP will be validated when user submits
  return <ResetPasswordForm email={email} token={token} />;
}
