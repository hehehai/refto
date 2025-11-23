import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import SiteCorrelation from "@/app/_components/site-correlation";
import { SiteDetail } from "@/app/_components/site-detail";
import { Separator } from "@/components/ui/separator";
import { correlation, detail } from "@/server/functions/ref-sites";

export const revalidate = 7200;

export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "Detail",
  });
  const site = await detail(id);
  if (!site) {
    notFound();
  }

  const sites = await correlation(site.siteTags, [site.id]);

  return (
    <div className="py-14">
      <SiteDetail className="relative" item={site} locale={locale} />

      <div className="container">
        <Separator className="my-12 md:my-28" />
        {sites?.length && (
          <div>
            <div className="mb-3 text-lg md:mb-6 md:text-2xl">
              {t("correlation.title")}
            </div>
            <SiteCorrelation sites={sites} />
          </div>
        )}
      </div>
    </div>
  );
}
