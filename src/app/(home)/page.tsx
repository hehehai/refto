import { Suspense } from "react";
import { HomeMasonry } from "@/app/_components/home-masonry";
import { HomeMasonrySkeleton } from "../_components/home-masonry-skeleton";
import { SiteEmailSubscription } from "../_components/site-email-subscription";
import { SiteShowcaseSheet } from "../_components/site-showcase-sheet";
import { env } from "@/env";
import { VideoWrapper } from "@/components/shared/video-wraper";

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const search = searchParams.s || "";
  const tags = searchParams.tags?.split(",").filter(Boolean) || [];

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
              <ul className="mt-6 space-y-1">
                <li>Stay on top of popular design trends</li>
                <li>Daily updates with an endless supply</li>
                <li>Receive the best websites of the week via email</li>
                <li>
                  Follow other media{" "}
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
              <Suspense fallback={<div>Loading...</div>}>
                <VideoWrapper
                  src={`${env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL}/video-cover-1.mp4`}
                  className="rounded-lg border border-zinc-50"
                />
              </Suspense>
            </div>
          </div>
          <div className="col-span-1 flex flex-col md:hidden lg:block">
            <div className="mt-auto space-y-6">
              <Suspense fallback={<div>Loading...</div>}>
                <VideoWrapper
                  src={`${env.NEXT_PUBLIC_CLOUD_FLARE_R2_URL}/video-cover-3.mp4`}
                  className="rounded-lg border border-zinc-50"
                />
              </Suspense>
            </div>
          </div>
        </section>
        <section className="mt-16 md:mt-24">
          <Suspense fallback={<HomeMasonrySkeleton />}>
            <HomeMasonry search={search} tags={tags} />
          </Suspense>
        </section>
      </div>
      <Suspense fallback={null}>
        <SiteShowcaseSheet />
      </Suspense>
    </div>
  );
}
