import { memo, useMemo } from "react";
import { BlurImage } from "@/components/shared/blur-image";
import { VisitIcon } from "@/components/shared/icons";
import { VideoWrapper } from "@/components/shared/video-wrapper";
import { Badge } from "@/components/ui/badge";
import { siteTagMap } from "@/lib/constants";
import type { SiteDetailData } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { VisitLink } from "./visit-link";

interface SiteDetailProps extends React.ComponentPropsWithoutRef<"div"> {
  item: SiteDetailData;
}

export const SiteDetail = memo(({ item, ...props }: SiteDetailProps) => {
  const tagsNode = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        {item.tags.map((tag) => (
          <div
            className="my-[3px] rounded-full border border-zinc-150 px-3 py-0.5 text-sm"
            key={tag}
          >
            {siteTagMap[tag] || tag}
          </div>
        ))}
      </div>
    ),
    [item.tags]
  );

  const metaNode = useMemo(
    () => (
      <div className="flex items-center space-x-7 px-0.5 py-1">
        <VisitLink
          className="flex items-center space-x-1 transition-opacity hover:opacity-90"
          count={item.visits}
          href={item.url}
          id={item.id}
          rel="noreferrer"
          target="_blank"
        >
          <VisitIcon className="text-[24px]" />
        </VisitLink>
      </div>
    ),
    [item.id, item.url, item.visits]
  );

  return (
    <div {...props} className={cn("pb-14 md:pb-20", props.className)}>
      <div className="container mt-4 mb-6 font-medium text-3xl leading-normal sm:text-4xl md:mt-14 lg:text-5xl">
        {item.title}
      </div>
      <div className="sticky inset-x-0 top-0 z-40 w-full bg-background py-5">
        <div className="container justify-between space-y-5 md:flex md:space-y-0">
          <div className="flex grow space-x-2">
            {item.logo && (
              <div className="overflow-hidden rounded-sm">
                <BlurImage
                  alt={item.title}
                  height={32}
                  src={item.logo}
                  width={32}
                />
              </div>
            )}
            <div className="flex space-x-4">
              <VisitLink
                className="shrink-0 text-xl hover:underline"
                href={item.url}
                id={item.id}
                rel="noreferrer"
                target="_blank"
              >
                {item.title}
              </VisitLink>
              {item.isPinned && (
                <Badge className="ml-auto shrink-0 px-3 py-0.5">TOP</Badge>
              )}
              <div className="hidden md:block">{tagsNode}</div>
              <div className="ml-4 shrink-0 md:hidden">{metaNode}</div>
            </div>
          </div>

          <div className="md:hidden">{tagsNode}</div>
          <div className="ml-4 hidden shrink-0 md:block">{metaNode}</div>
        </div>
      </div>
      <div className="container">
        <div className="mt-6 space-y-8 md:mt-20">
          <div className="relative">
            <div className="absolute top-0 left-0 font-medium text-2xl md:top-[3px] md:text-4xl">
              {"//"}
            </div>
            <div className="relative z-10 ml-7 md:ml-12 md:text-lg">
              {item.description}
            </div>
          </div>
          {item.siteOG && (
            <img
              alt={item.title}
              className="mx-auto block rounded-lg ring-1 ring-zinc-100 dark:ring-zinc-900"
              src={item.siteOG}
            />
          )}
          {item.webRecord && item.webCover ? (
            <VideoWrapper
              cover={item.webCover}
              height={"auto"}
              src={item.webRecord}
              width={"100%"}
            />
          ) : (
            item.webCover && (
              <img
                alt={item.title}
                className="mx-auto block rounded-lg ring-1 ring-zinc-100 dark:ring-zinc-900"
                src={item.webCover}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
});

SiteDetail.displayName = "SiteDetail";
