import { z } from "zod";

// Legacy: User auth schema for old UserAuthForm component
export const userAuthSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Sign in with email (magic link)
export const signInEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type SignInEmailFormData = z.infer<typeof signInEmailSchema>;

// Sign in with email and password
export const signInPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInPasswordFormData = z.infer<typeof signInPasswordSchema>;

// Sign in with email OTP
export const signInOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().optional(),
});

export type SignInOtpFormData = z.infer<typeof signInOtpSchema>;

// Sign up
export const signUpSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    passwordConfirmation: z.string().min(1, "Please confirm your password"),
    image: z.instanceof(File).optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Forgot password / Reset password email
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Alias for forgot-password-email component
export const resetPasswordEmailSchema = forgotPasswordSchema;
export type ResetPasswordEmailFormData = ForgotPasswordFormData;

// Reset password / Set new password
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    passwordConfirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Alias for forgot-password-set component
export const resetPasswordSetSchema = resetPasswordSchema;
export type ResetPasswordSetFormData = ResetPasswordFormData;
