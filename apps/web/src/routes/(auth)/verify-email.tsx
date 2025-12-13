import { auth } from "@refto-one/auth";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { VerifyEmailInvalid } from "@/components/features/auth/verify-email-invalid";
import { VerifyEmailSuccess } from "@/components/features/auth/verify-email-success";

const searchSchema = z.object({
  token: z.string(),
  email: z.email(),
});

export const Route = createFileRoute("/(auth)/verify-email")({
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    const { token } = search;

    const result = await auth.api.verifyEmail({
      query: {
        token,
      },
    });

    return result;
  },
  component: RouteComponent,
  errorComponent: VerifyEmailInvalid,
});

function RouteComponent() {
  const { email } = Route.useSearch();
  const success = Route.useLoaderData();

  if (success) {
    return <VerifyEmailSuccess />;
  }

  return <VerifyEmailInvalid email={email} />;
}
