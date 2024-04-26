import { SiteDetail } from "@/app/_components/site-detail";
import { correlation, detail } from "@/server/functions/ref-sites";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteShowcase } from "@/app/_components/site-showcase";
import { getTranslations } from "next-intl/server";

export const revalidate = 7200;

export default async function SitePage({ params }: { params: { id: string, locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Detail" });
  const site = await detail(params.id);
  if (!site) {
    notFound();
  }

  const sites = await correlation(site.siteTags, [site.id]);

  return (
    <div className="py-14">
      <SiteDetail item={site} className="relative" />

      <div className="container">
        <Separator className="my-12 md:my-28" />
        {sites?.length && (
          <div>
            <div className="mb-3 text-lg md:mb-6 md:text-2xl">
              {t('correlation.title')}
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:gap-8">
              {sites.map((item) => (
                <Link
                  href={`/${item.id}`}
                  key={item.id}
                  className="w-full"
                  legacyBehavior
                >
                  <SiteShowcase item={item} fixedHeight={280} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
