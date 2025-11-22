import { BlurImage } from "@/components/shared/blur-image";
import { VisitIcon } from "@/components/shared/icons";
import { VideoWrapper } from "@/components/shared/video-wrapper";
import { cn } from "@/lib/utils";
import { VisitLink } from "./visit-link";

interface SiteShowcaseProps extends React.ComponentPropsWithoutRef<"div"> {
  item: {
    id: string;
    siteUrl: string;
    siteName: string;
    siteFavicon: string;
    siteCover: string;
    siteCoverRecord: string;
    siteCoverWidth?: number;
    siteCoverHeight?: number;
    visits: number;
  };
  fixedHeight?: number;
  onDetail?: (id: string) => void;
}

export const SiteShowcase = ({
  item,
  fixedHeight,
  onDetail,
  ...props
}: SiteShowcaseProps) => {
  return (
    <div
      className={cn(
        "flex w-full cursor-pointer flex-col rounded-[14px] bg-transparent p-1 transition-colors duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-800",
        props.className
      )}
      key={item.id}
    >
      <div
        className="relative w-full overflow-hidden rounded-xl border border-[rgba(241,245,248,0.80)] dark:border-zinc-800"
        onClick={() => onDetail?.(item.id)}
        style={{ height: fixedHeight ? `${fixedHeight}px` : undefined }}
      >
        {item.siteCoverRecord ? (
          <VideoWrapper
            className="duration-500 hover:scale-[1.02]"
            cover={item.siteCover}
            height={item.siteCoverHeight}
            src={item.siteCoverRecord}
            width={item.siteCoverWidth}
          />
        ) : fixedHeight ? (
          <BlurImage
            alt={item.siteName}
            className="object-cover object-top hover:scale-[1.02]"
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={item.siteCover}
          />
        ) : (
          <BlurImage
            alt={item.siteName}
            className="hover:scale-[1.02]"
            height={item.siteCoverHeight}
            src={item.siteCover}
            width={item.siteCoverWidth}
          />
        )}
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="flex grow items-center space-x-1">
          {item.siteFavicon && (
            <div className="overflow-hidden rounded-sm">
              <BlurImage
                alt={item.siteName}
                height={16}
                src={item.siteFavicon}
                width={16}
              />
            </div>
          )}
          <div className="font-medium text-foreground/80 text-sm">
            {item.siteName}
          </div>
        </div>
        <div className="flex items-center space-x-3 px-0.5 py-1">
          {/* <div className="flex items-center space-x-1 opacity-80 transition-opacity hover:opacity-100">
            <LikeIcon className="text-lg" />
            <span>{item.likes}</span>
          </div> */}
          <VisitLink
            className="flex items-center space-x-1 opacity-80 transition-opacity hover:opacity-100"
            count={item.visits}
            href={item.siteUrl}
            id={item.id}
            rel="noreferrer"
            target="_blank"
          >
            <VisitIcon className="text-[16px]" />
          </VisitLink>
        </div>
      </div>
    </div>
  );
};
