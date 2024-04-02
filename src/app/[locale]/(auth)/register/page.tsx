import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UserAuthForm } from "@/components/shared/user-auth-form";
import { Suspense } from "react";
import { site } from "@/lib/config/site";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Create an account",
  description: "Create an account to get started.",
};

export default async function RegisterPage() {
  const t = await getTranslations("Auth.register");
  return (
    <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8",
        )}
      >
        {t("login")}
      </Link>
      <div className="hidden h-full bg-muted lg:block" />
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <span className="mx-auto text-5xl font-medium">{site.name}</span>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("welcome")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("m1")}</p>
          </div>
          <Suspense fallback={null}>
            <UserAuthForm />
          </Suspense>
          <p className="px-5 text-center text-sm text-muted-foreground">
            {t("m2")}{" "}
            <Link
              href="/terms"
              className="hover:text-brand underline underline-offset-4"
            >
              {t("m3")}
            </Link>{" "}
            {t("m4")}{" "}
            <Link
              href="/privacy"
              className="hover:text-brand underline underline-offset-4"
            >
              {t("m5")}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
