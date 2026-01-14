import { FeedSort, type FeedSortType, site } from "@refto-one/common";
import { Link, useNavigate } from "@tanstack/react-router";
import { BadgeLinearGradient } from "@/components/shared/badge-linear-gradient";
import { TagSelect } from "@/components/shared/tag-select";
import { VideoWrapper } from "@/components/shared/video-wrapper";
import { getCFImageUrlByPreset } from "@/components/ui/cf-image";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PinnedSite } from "@/lib/orpc-types";

interface HeroSectionProps {
  pinnedSites: PinnedSite[];
  sort: FeedSortType;
  currentTag?: string;
}

export function HeroSection({
  pinnedSites,
  sort,
  currentTag,
}: HeroSectionProps) {
  const [first, second, third] = pinnedSites;
  const navigate = useNavigate();
  const [primaryTagline, ...restTaglineParts] = site.description
    .split(". ")
    .map((part) => part.trim())
    .filter(Boolean);
  const secondaryTagline =
    restTaglineParts.length > 0 ? restTaglineParts.join(". ") : undefined;

  const handleSortChange = (value: string) => {
    navigate({
      to: "/",
      search: (prev) => ({ ...prev, sort: value as FeedSortType }),
      reloadDocument: false,
    });
  };

  const handleTagChange = (tagIds: string[]) => {
    navigate({
      to: "/",
      search: (prev) => ({
        ...prev,
        tag: tagIds.length > 0 ? tagIds.join(",") : undefined,
      }),
      reloadDocument: false,
    });
  };

  return (
    <section className="w-full">
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="flex items-end justify-between gap-32">
          <div className="w-1/2">
            <Link to="/weekly">
              <BadgeLinearGradient className="mb-5">
                <span className="text-balance">Weekly Top: Like to Vote</span>
                <span className="i-hugeicons-arrow-right-01" />
              </BadgeLinearGradient>
            </Link>
            <h2 className="text-nowrap text-3xl leading-tight md:text-4xl lg:text-5xl">
              {primaryTagline ?? site.description}
              {secondaryTagline && (
                <>
                  <br />
                  {secondaryTagline}
                </>
              )}
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
            <div className="mt-10 flex items-center gap-3">
              <Tabs onValueChange={handleSortChange} value={sort}>
                <TabsList>
                  <TabsTrigger className="px-3" value={FeedSort.LATEST}>
                    Latest
                  </TabsTrigger>
                  <TabsTrigger className="px-3" value={FeedSort.TRENDING}>
                    Trending
                  </TabsTrigger>
                  <TabsTrigger className="px-3" value={FeedSort.POPULAR}>
                    Popular
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {currentTag && (
                <TagSelect
                  className="w-48"
                  onChange={handleTagChange}
                  placeholder="Filter by tags..."
                  value={currentTag.split(",")}
                />
              )}
            </div>
          </div>
          <div className="grid w-1/2 grid-cols-2 gap-8">
            <div className="col-span-1 flex flex-col">
              <div className="mt-auto">
                {first?.version && (
                  <VideoWrapper
                    className="rounded-xl border border-y-zinc-100 dark:border-zinc-900"
                    cover={getCFImageUrlByPreset(
                      first.version.webCover,
                      "webCoverThumb"
                    )}
                    preset="webRecordThumb"
                    src={first.version.webRecord}
                  />
                )}
              </div>
            </div>
            <div className="col-span-1">
              <div className="flex flex-col justify-end gap-6 lg:min-h-96.75">
                {second?.version && (
                  <VideoWrapper
                    className="rounded-xl border border-zinc-100 dark:border-zinc-900"
                    cover={getCFImageUrlByPreset(
                      second.version.webCover,
                      "webCoverThumb"
                    )}
                    preset="webRecordThumb"
                    src={second.version.webRecord}
                  />
                )}
                {third?.version && (
                  <VideoWrapper
                    className="rounded-xl border border-zinc-100 dark:border-zinc-900"
                    cover={getCFImageUrlByPreset(
                      third.version.webCover,
                      "webCoverThumb"
                    )}
                    preset="webRecordThumb"
                    src={third.version.webRecord}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
