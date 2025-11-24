import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { protectedProcedure } from "@/server/api/orpc";

// Set password for users without credential account (e.g., OAuth users)
const setPasswordProcedure = protectedProcedure
  .input(
    z.object({
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
    })
  )
  .handler(async ({ input, context }) => {
    await auth.api.setPassword({
      body: { newPassword: input.newPassword },
      headers: context.headers,
    });
    return { success: true };
  });

export const userRouter = {
  setPassword: setPasswordProcedure,
};
