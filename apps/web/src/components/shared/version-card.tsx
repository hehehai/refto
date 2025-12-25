import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { CircularProgressButton } from "./circular-progress-button";
import { LikeButton } from "./like-button";
import { VideoWrapper } from "./video-wrapper";

interface VersionCardProps {
  version: {
    id: string;
    webCover: string;
    webRecord?: string | null;
    versionDate: Date;
  };
  page: {
    id: string;
    title: string;
    slug: string;
    url: string;
  };
  site: {
    id: string;
    title: string;
    slug: string;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const hasVideo = Boolean(version.webRecord);

  // Timer effect for progress tracking
  useEffect(() => {
    if (!playing || duration === 0) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1;
        if (next >= duration) {
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [playing, duration]);

  // Reset currentTime when video loops
  const handleLoop = useCallback(() => {
    setCurrentTime(0);
  }, []);

  const handleTogglePlay = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-card">
      {/* Content area - clickable to detail page */}
      <div className="group relative bg-muted p-3">
        <Link
          className="relative block aspect-video overflow-hidden"
          params={{
            siteSlug: site.slug,
            pageSlug: page.slug,
            versionSlug: format(version.versionDate, "yyyy-MM-dd"),
          }}
          to="/$siteSlug/$pageSlug/$versionSlug"
        >
          {hasVideo ? (
            <VideoWrapper
              className="size-full rounded-[10px] object-cover"
              cover={version.webCover}
              onDurationChange={setDuration}
              onLoop={handleLoop}
              onPlayingChange={setPlaying}
              ref={videoRef}
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

        {/* Circular progress button - only show for videos */}
        {hasVideo && (
          <CircularProgressButton
            className="absolute top-4.5 right-4.5 opacity-0 group-hover:opacity-100"
            onClick={handleTogglePlay}
            playing={playing}
            progress={progress}
          />
        )}
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
