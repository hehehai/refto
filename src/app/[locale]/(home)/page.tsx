import { Suspense } from "react";
import { HomeMasonry } from "@/app/_components/home-masonry";
import { HomeMasonrySkeleton } from "../../_components/home-masonry-skeleton";
import { SiteEmailSubscription } from "../../_components/site-email-subscription";
import { SiteShowcaseSheet } from "../../_components/site-showcase-sheet";
import { env } from "@/env";
import { VideoWrapper } from "@/components/shared/video-wrapper";
import { queryWithCursor } from "@/server/functions/ref-sites";
import { queryWithCursorRefSiteSchema } from "@/lib/validations/ref-site";
import { getTranslations } from "next-intl/server";

export const revalidate = 7200;

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const t = await getTranslations();
  const search = searchParams.s || "";
  const tags = searchParams.tags?.split(",").filter(Boolean) || [];

  const initParams = queryWithCursorRefSiteSchema.parse({
    search,
    tags,
    limit: 10,
  });

  const siteQuery = await queryWithCursor(initParams);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <section className="mt-16 grid-cols-1 space-y-6 md:mt-24 md:grid md:grid-cols-3 md:gap-8 md:space-y-0 lg:grid-cols-4">
          <div className="col-span-2 flex flex-col">
            <div className="">
              <h2 className="text-nowrap text-3xl leading-tight md:text-5xl lg:text-6xl">
                {t("Index.slogan.s1")}
                <br />
                {t("Index.slogan.s2")}
              </h2>
              <ul className="mt-10 space-y-1.5">
                <li>✦ {t("Index.features.f1")}</li>
                <li>✦ {t("Index.features.f2")}</li>
                <li>✦ {t("Index.features.f3")}</li>
                <li>
                  ✦ {t("Index.features.f4")}{" "}
                  <a
                    href="https://twitter.com/riverhohai"
                    target="_blank"
                    className="hover:underline"
                  >
                    X.com
                  </a>
                </li>
              </ul>
            </div>
            <SiteEmailSubscription className="mt-6 items-center space-y-3 sm:flex sm:space-x-5 sm:space-y-0 lg:mt-auto" />
          </div>
          <div className="col-span-1 flex flex-col">
            <div className="mt-auto">
              <Suspense fallback={<div>{t("Site.loading")}...</div>}>
                <VideoWrapper
                  cover={`${env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL}/video-cover-holder-1.mp4`}
                  src={`${env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL}/video-cover-1.mp4`}
                  className="rounded-lg border border-zinc-50"
                />
              </Suspense>
            </div>
          </div>
          <div className="col-span-1 flex flex-col md:hidden lg:block">
            <div className="mt-auto space-y-6 lg:min-h-[387px]">
              <Suspense fallback={<div>{t("Site.loading")}...</div>}>
                <VideoWrapper
                  cover={`${env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL}/video-cover-holder-3.mp4`}
                  src={`${env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL}/video-cover-3.mp4`}
                  className="rounded-lg border border-zinc-50"
                />
              </Suspense>
            </div>
          </div>
        </section>
        <section className="mt-16 md:mt-24">
          <Suspense fallback={<HomeMasonrySkeleton />}>
            <HomeMasonry
              search={search}
              tags={tags}
              firstSlice={siteQuery.rows}
              initNextCursor={siteQuery.nextCursor}
            />
          </Suspense>
        </section>
      </div>
      <Suspense fallback={null}>
        <SiteShowcaseSheet />
      </Suspense>
    </div>
  );
}
