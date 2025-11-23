"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { SignUpFormData } from "@/lib/validations/auth";
import { SigninThirdAuth } from "./signin-third-auth";
import { SignupForm } from "./signup-form";

export const SignUp = () => {
  const router = useRouter();

  const convertImageToBase64 = async (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (data: SignUpFormData) => {
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
        router.push("/");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create account"
      );
    }
  };

  return (
    <div className="w-full max-w-sm">
      <header>
        <Image
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
        <Button className="w-full" type="submit">
          Create account
        </Button>
      </SignupForm>
      <SigninThirdAuth />
      <footer className="mt-10">
        <p className="text-secondary-foreground text-sm">
          Already have an account?{" "}
          <Link className="text-foreground hover:underline" href="/signin">
            Sign in
          </Link>
        </p>
      </footer>
    </div>
  );
};
