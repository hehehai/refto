import { VideoWrapper } from "@/components/shared/video-wrapper";
import type { PinnedSite } from "@/lib/orpc-types";

interface HeroSectionProps {
  pinnedSites: PinnedSite[];
}

export function HeroSection({ pinnedSites }: HeroSectionProps) {
  const [first, second, third] = pinnedSites;

  return (
    <section className="w-full">
      <div className="container mx-auto px-4">
        <div className="mt-16 grid-cols-1 space-y-6 md:mt-24 md:grid md:grid-cols-3 md:gap-8 md:space-y-0 lg:grid-cols-4">
          <div className="col-span-2 flex flex-col">
            <div className="">
              <h2 className="text-nowrap text-3xl leading-tight md:text-4xl lg:text-5xl">
                Unleash limitless inspiration
                <br />
                Embrace pure simplicity
              </h2>
              <ul className="mt-10 space-y-1.5">
                <li>✦ Curated design references</li>
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
          </div>
          <div className="col-span-1 flex flex-col">
            <div className="mt-auto">
              {first?.version && (
                <VideoWrapper
                  className="rounded-lg border border-zinc-50 dark:border-zinc-900"
                  cover={first.version.webCover}
                  src={first.version.webRecord}
                />
              )}
            </div>
          </div>
          <div className="col-span-1 flex flex-col md:hidden lg:block">
            <div className="mt-auto space-y-6 lg:min-h-[387px]">
              {second?.version && (
                <VideoWrapper
                  className="rounded-lg border border-zinc-50 dark:border-zinc-900"
                  cover={second.version.webCover}
                  src={second.version.webRecord}
                />
              )}
              {third?.version && (
                <VideoWrapper
                  className="rounded-lg border border-zinc-50 dark:border-zinc-900"
                  cover={third.version.webCover}
                  src={third.version.webRecord}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
