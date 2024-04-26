import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UserAuthForm } from "@/components/shared/user-auth-form";
import { site } from "@/lib/config/site";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "Auth" });

  return {
    title: t('login.title'),
    description: t('login.description'),
  }
};

export default async function LoginPage() {
  const t = await getTranslations("Auth.login");
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8",
        )}
      >
        <>
          <span className="i-lucide-chevron-left mr-2 h-4 w-4" />
          {t("back")}
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <span className="mx-auto text-5xl font-medium">{site.name}</span>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("welcome")}
          </h1>
          <p className="text-center text-sm text-muted-foreground">{t("m1")}</p>
        </div>
        <UserAuthForm isLogin/>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/register"
            className="hover:text-brand underline underline-offset-4"
          >
            {t("m2")}
          </Link>
        </p>
      </div>
    </div>
  );
}
