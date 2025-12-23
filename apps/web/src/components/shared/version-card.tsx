import { Link } from "@tanstack/react-router";
import { LikeButton } from "./like-button";
import { VideoWrapper } from "./video-wrapper";

interface VersionCardProps {
  version: {
    id: string;
    webCover: string;
    webRecord?: string | null;
  };
  page: {
    id: string;
    title: string;
    url: string;
  };
  site: {
    id: string;
    title: string;
    logo: string;
    url: string;
  };
  liked: boolean;
  onLikeChange?: (liked: boolean) => void;
}

export function VersionCard({
  version,
  page,
  site,
  liked = false,
  onLikeChange,
}: VersionCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-card">
      {/* Content area - clickable to detail page */}
      <div className="bg-muted p-3">
        <Link
          className="relative aspect-video overflow-hidden"
          params={{ pageVersionId: version.id }}
          to="/$pageVersionId"
        >
          {version.webRecord ? (
            <VideoWrapper
              className="size-full rounded-[10px] object-cover"
              cover={version.webCover}
              src={version.webRecord}
            />
          ) : (
            <img
              alt={page.title}
              className="size-full rounded-[10px] object-cover"
              loading="lazy"
              src={version.webCover}
            />
          )}
        </Link>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 bg-muted px-3 pb-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* Site logo */}
          <a
            className="shrink-0"
            href={site.url}
            onClick={(e) => e.stopPropagation()}
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              alt={site.title}
              className="size-5.5 rounded object-cover"
              src={site.logo}
            />
          </a>

          {/* Page title */}
          <a
            className="max-w-sm truncate text-muted-foreground text-sm hover:text-foreground hover:underline"
            href={page.url}
            onClick={(e) => e.stopPropagation()}
            rel="noopener noreferrer"
            target="_blank"
          >
            {site.title}
          </a>
        </div>

        {/* Like button */}
        <LikeButton
          liked={liked}
          onLikeChange={onLikeChange}
          versionId={version.id}
        />
      </div>
    </div>
  );
}
