import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { HomeMasonry } from "@/components/features/home/home-masonry";
import { HomeMasonrySkeleton } from "@/components/features/home/home-masonry-skeleton";
import { SiteEmailSubscription } from "@/components/features/site/site-email-subscription";
import { SiteShowcaseSheet } from "@/components/features/site/site-showcase-sheet";
import { VideoWrapper } from "@/components/shared/video-wrapper";
import { env } from "@/env";
import { homeSearchParamsCache } from "@/lib/search-params";
import { getSession } from "@/lib/session";
import { queryWithCursorRefSiteSchema } from "@/lib/validations/ref-site";
import { getWeeklyCount, queryWithCursor } from "@/server/functions/ref-sites";

export const revalidate = 7200;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { s: search, tags } = await homeSearchParamsCache.parse(searchParams);

  const initParams = queryWithCursorRefSiteSchema.parse({
    search,
    tags,
    limit: 10,
  });

  const [siteQuery, session, weeklyCount] = await Promise.all([
    queryWithCursor(initParams),
    getSession(),
    getWeeklyCount(),
  ]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <section className="mt-16 grid-cols-1 space-y-6 md:mt-24 md:grid md:grid-cols-3 md:gap-8 md:space-y-0 lg:grid-cols-4">
          <div className="col-span-2 flex flex-col">
            <div className="">
              <h2 className="text-nowrap text-3xl leading-tight md:text-5xl lg:text-6xl">
                Unleash limitless inspiration
                <br />
                Embrace pure simplicity
              </h2>
              <ul className="mt-10 space-y-1.5">
                <li>✦ Curated design references</li>
                <li>✦ Weekly inspiration newsletter</li>
                <li>✦ High-quality screenshots</li>
                <li>
                  ✦ Follow us on{" "}
                  <a
                    className="hover:underline"
                    href="https://twitter.com/riverhohai"
                    rel="noreferrer"
                    target="_blank"
                  >
                    X.com
                  </a>
                </li>
              </ul>
            </div>
            <SiteEmailSubscription
              className="mt-6 lg:mt-auto"
              user={session?.user}
              weeklyCount={weeklyCount}
            />
          </div>
          <div className="col-span-1 flex flex-col">
            <div className="mt-auto">
              <Suspense fallback={<div>Loading...</div>}>
                <VideoWrapper
                  className="rounded-lg border border-zinc-50 dark:border-zinc-900"
                  cover={`${env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL}/video-cover-holder-1.mp4`}
                  src={`${env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL}/video-cover-1.mp4`}
                />
              </Suspense>
            </div>
          </div>
          <div className="col-span-1 flex flex-col md:hidden lg:block">
            <div className="mt-auto space-y-6 lg:min-h-[387px]">
              <Suspense fallback={<div>Loading...</div>}>
                <VideoWrapper
                  className="rounded-lg border border-zinc-50 dark:border-zinc-900"
                  cover={`${env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL}/video-cover-holder-3.mp4`}
                  src={`${env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL}/video-cover-3.mp4`}
                />
              </Suspense>
            </div>
          </div>
        </section>
        <section className="mt-16 md:mt-24">
          <Suspense fallback={<HomeMasonrySkeleton />}>
            <HomeMasonry
              firstSlice={siteQuery.rows}
              initNextCursor={siteQuery.nextCursor}
              search={search}
              tags={tags}
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
