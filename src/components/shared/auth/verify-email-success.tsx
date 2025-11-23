"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const VerifyEmailSuccess = () => {
  const router = useRouter();

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
        <h1 className="mb-1 text-2xl">Email Verified</h1>
        <p className="mb-8 text-secondary-foreground">
          Your email has been verified successfully. You can now sign in to your
          account.
        </p>
      </header>
      <Button className="w-full" onClick={() => router.push("/signin")}>
        Go to Sign In
      </Button>
      <footer className="mt-10">
        <p className="text-secondary-foreground text-sm">
          Need help?{" "}
          <Link className="text-foreground hover:underline" href="/contact">
            Contact us
          </Link>
        </p>
      </footer>
    </div>
  );
};
