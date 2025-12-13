import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { SignIn } from "@/components/features/auth/signin";

const routeSearchSchema = z.object({
  mode: z.enum(["email", "email-otp", "password"]).default("email").nullish(),
  error: z.string().nullish(),
  error_description: z.string().nullish(),
});

export const Route = createFileRoute("/(auth)/signin")({
  validateSearch: routeSearchSchema,
  component: SignIn,
});
