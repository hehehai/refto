import { Link } from "@tanstack/react-router";
import { LikeButton } from "./like-button";

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
  liked,
  onLikeChange,
}: VersionCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      {/* Content area - clickable to detail page */}
      <Link
        className="relative aspect-video overflow-hidden bg-muted"
        params={{ pageVersionId: version.id }}
        to="/$pageVersionId"
      >
        {version.webRecord ? (
          <video
            autoPlay
            className="size-full object-cover"
            loop
            muted
            playsInline
            poster={version.webCover}
          >
            <source src={version.webRecord} type="video/mp4" />
          </video>
        ) : (
          <img
            alt={page.title}
            className="size-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            src={version.webCover}
          />
        )}
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* Site logo */}
          <a
            className="flex-shrink-0"
            href={site.url}
            onClick={(e) => e.stopPropagation()}
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              alt={site.title}
              className="size-6 rounded object-cover"
              src={site.logo}
            />
          </a>

          {/* Page title */}
          <a
            className="truncate text-muted-foreground text-sm hover:text-foreground hover:underline"
            href={page.url}
            onClick={(e) => e.stopPropagation()}
            rel="noopener noreferrer"
            target="_blank"
          >
            {page.title}
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
