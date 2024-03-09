import { BlurImage } from "@/components/shared/blur-image";
import { LikeIcon, VisitIcon } from "@/components/shared/icons";
import { cn } from "@/lib/utils";

interface SiteShowcaseProps extends React.ComponentPropsWithoutRef<"div"> {
  item: {
    id: string;
    siteUrl: string;
    siteName: string;
    siteFavicon: string;
    siteCover: string;
    siteCoverWidth?: number;
    siteCoverHeight?: number;
    likes: number;
    visits: number;
  };
  fixedHeight?: number;
}

export const SiteShowcase = ({
  item,
  fixedHeight,
  ...props
}: SiteShowcaseProps) => {
  return (
    <div
      key={item.id}
      {...props}
      className={cn(
        "flex w-full cursor-pointer flex-col rounded-[14px] p-1 transition-all hover:bg-zinc-100",
        props.className,
      )}
    >
      <div
        className="relative w-full overflow-hidden rounded-xl border border-[rgb(232,238,241)]"
        style={{ height: fixedHeight ? `${fixedHeight}px` : undefined }}
      >
        {fixedHeight ? (
          <BlurImage
            src={item.siteCover}
            alt={item.siteName}
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <BlurImage
            src={item.siteCover}
            alt={item.siteName}
            width={item.siteCoverWidth}
            height={item.siteCoverHeight}
          />
        )}
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-grow items-center space-x-1">
          {item.siteFavicon && (
            <div className="overflow-hidden rounded-sm">
              <BlurImage
                src={item.siteFavicon}
                width={16}
                height={16}
                alt={item.siteName}
              />
            </div>
          )}
          <a
            href={item.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="max-w-[60%] truncate text-[15px] text-foreground hover:underline"
          >
            {item.siteName}
          </a>
        </div>
        <div className="flex items-center space-x-3 px-0.5 py-1">
          <div className="flex items-center space-x-1 opacity-80 transition-opacity hover:opacity-100">
            <LikeIcon className="text-lg" />
            <span>{item.likes}</span>
          </div>
          <a
            href={item.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 opacity-80 transition-opacity hover:opacity-100"
          >
            <VisitIcon className="text-[16px]" />
            <span>{item.visits}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
