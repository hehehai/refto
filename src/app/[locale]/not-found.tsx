import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

async function notFound() {
  const t = await getTranslations("NotFound");
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="font-semibold text-base text-foreground">404</p>
        <h1 className="mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-base text-foreground/85 leading-7">
          {t("description")}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild>
            <Link href="/">{t("back")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default notFound;
