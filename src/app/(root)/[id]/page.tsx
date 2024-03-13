import { SiteDetail } from "@/app/_components/site-detail";
import { SiteShowcaseSheet } from "@/app/_components/site-showcase-sheet";
import { correlation, detail } from "@/server/functions/ref-sites";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { SiteShowcase } from "@/app/_components/site-showcase";

export default async function SitePage({ params }: { params: { id: string } }) {
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
            <div className="mb-3 md:mb-6 text-lg md:text-2xl">You might also like</div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:gap-8">
              {sites.map((item) => (
                <Link
                  href={`/${item.id}`}
                  key={item.id}
                  className="w-full"
                  legacyBehavior
                >
                  <SiteShowcase item={item} fixedHeight={400} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
