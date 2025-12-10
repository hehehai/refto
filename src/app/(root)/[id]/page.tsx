import { notFound } from "next/navigation";
import SiteCorrelation from "@/components/features/site/site-correlation";
import { SiteDetail } from "@/components/features/site/site-detail";
import { Separator } from "@/components/ui/separator";
import { correlation, detail } from "@/server/functions/sites";

export const revalidate = 7200;

export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await detail(id);
  if (!site) {
    notFound();
  }

  const sites = await correlation(site.tags, [site.id]);

  return (
    <div className="py-14">
      <SiteDetail className="relative" item={site} />

      <div className="container">
        <Separator className="my-12 md:my-28" />
        {sites?.length && (
          <div>
            <div className="mb-3 text-lg md:mb-6 md:text-2xl">
              Related Sites
            </div>
            <SiteCorrelation sites={sites} />
          </div>
        )}
      </div>
    </div>
  );
}
