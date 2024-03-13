import { BlurImage } from "@/components/shared/blur-image";
import { LikeIcon, VisitIcon } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { siteTagMap } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { type RefSite } from "@prisma/client";
import { memo, useMemo } from "react";
import { VisitLink } from "./visit-link";

interface SiteDetailProps extends React.ComponentPropsWithoutRef<"div"> {
  item: RefSite;
}

export const SiteDetail = memo(({ item, ...props }: SiteDetailProps) => {
  const tagsNode = useMemo(() => {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {item.siteTags.map((tag) => (
          <div
            key={tag}
            className="border-zinc-150 rounded-full border px-3 py-0.5 text-sm"
          >
            {siteTagMap[tag]?.en}
          </div>
        ))}
      </div>
    );
  }, [item.siteTags]);

  const metaNode = useMemo(() => {
    return (
      <div className="flex items-center space-x-7 px-0.5 py-1">
        {/* <div className="flex items-center space-x-1 text-xl transition-opacity hover:opacity-90">
      <LikeIcon className="text-2xl" />
      <span>{item.likes}</span>
    </div> */}
        <VisitLink
          id={item.id}
          href={item.siteUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1 transition-opacity hover:opacity-90"
          count={item.visits}
        >
          <VisitIcon className="text-[24px]" />
        </VisitLink>
      </div>
    );
  }, [item.id, item.likes, item.siteUrl, item.visits]);

  return (
    <div {...props} className={cn("pb-14 md:pb-20", props.className)}>
      <div className="container mb-6 mt-4 text-3xl font-medium leading-normal sm:text-4xl md:mt-14 lg:text-5xl">
        {item.siteTitle}
      </div>
      <div className="sticky inset-x-0 top-0 z-40 w-full bg-white py-5">
        <div className="container justify-between md:flex space-y-5 md:space-y-0">
          <div className="flex flex-grow space-x-2">
            {item.siteFavicon && (
              <div className="overflow-hidden rounded-sm">
                <BlurImage
                  src={item.siteFavicon}
                  width={32}
                  height={32}
                  alt={item.siteName}
                />
              </div>
            )}
            <div className="flex items-center space-x-4">
              <VisitLink
                id={item.id}
                href={item.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xl hover:underline"
              >
                {item.siteName}
              </VisitLink>
              {item.siteUrl && (
                <VisitLink
                  id={item.id}
                  href={item.siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden md:block"
                >
                  <VisitIcon className="text-2xl" />
                </VisitLink>
              )}
              {item.isTop && <Badge className="ml-auto px-3 py-0.5">TOP</Badge>}
              <div className="hidden md:block">{tagsNode}</div>
              <div className="md:hidden">{metaNode}</div>
            </div>
          </div>

          <div className="md:hidden">{tagsNode}</div>
          <div className="hidden md:block">{metaNode}</div>
        </div>
      </div>
      <div className="container">
        <div className="mt-6 md:mt-20 space-y-8">
          <div className="relative">
            <div className="absolute left-0 top-0 md:top-[3px] text-2xl md:text-4xl font-medium">
              {"//"}
            </div>
            <div className="relative z-10 ml-7 md:ml-12 md:text-lg">
              {item.siteDescription}
            </div>
          </div>
          {item.siteOGImage && (
            <img
              src={item.siteOGImage}
              alt={item.siteName}
              className="mx-auto block rounded-lg ring-1 ring-zinc-100"
            />
          )}
          {(item.siteScreenshot || item.siteCover) && (
            <img
              src={item.siteScreenshot || item.siteCover}
              alt={item.siteName}
              className="mx-auto block rounded-lg ring-1 ring-zinc-100"
            />
          )}
        </div>
      </div>
    </div>
  );
});

SiteDetail.displayName = "SiteDetail";
