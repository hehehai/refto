import type { SignUpFormData } from "@refto-one/config";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { SigninThirdAuth } from "./signin-third-auth";
import { SignupForm } from "./signup-form";

export const SignUp = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const convertImageToBase64 = async (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (data: SignUpFormData) => {
    setIsPending(true);
    const image = data.image ? await convertImageToBase64(data.image) : "";

    try {
      const { error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        image,
      });
      if (error) {
        toast.error(error.message || "Failed to create account");
      } else {
        toast.success("Account created successfully");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create account"
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <header>
        <img
          alt="Logo"
          className="mb-3 size-10"
          height={60}
          src="/images/logo.svg"
          width={60}
        />
        <h1 className="mb-1 text-2xl">Sign Up</h1>
        <p className="mb-8 text-secondary-foreground">
          Create an account to get started
        </p>
      </header>
      <SignupForm onSubmit={handleSubmit}>
        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </SignupForm>
      <SigninThirdAuth />
      <footer className="mt-10">
        <p className="text-secondary-foreground text-sm">
          Already have an account?{" "}
          <Link className="text-foreground hover:underline" to="/signin">
            Sign in
          </Link>
        </p>
      </footer>
    </div>
  );
};
