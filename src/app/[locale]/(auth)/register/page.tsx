import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { UserAuthForm } from "@/components/shared/user-auth-form";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/config/site";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Auth" });

  return {
    title: t("register.title"),
    description: t("register.description"),
  };
}

export default async function RegisterPage() {
  const t = await getTranslations("Auth.register");
  return (
    <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute top-4 right-4 md:top-8 md:right-8"
        )}
        href="/login"
      >
        {t("login")}
      </Link>
      <div className="hidden h-full bg-muted lg:block" />
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <span className="mx-auto font-medium text-5xl">{site.name}</span>
            <h1 className="font-semibold text-2xl tracking-tight">
              {t("welcome")}
            </h1>
            <p className="text-muted-foreground text-sm">{t("m1")}</p>
          </div>
          <Suspense fallback={null}>
            <UserAuthForm isLogin={false} />
          </Suspense>
          <p className="px-5 text-center text-muted-foreground text-sm">
            {t("m2")}{" "}
            <Link
              className="underline underline-offset-4 hover:text-brand"
              href="/terms"
            >
              {t("m3")}
            </Link>{" "}
            {t("m4")}{" "}
            <Link
              className="underline underline-offset-4 hover:text-brand"
              href="/privacy"
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
