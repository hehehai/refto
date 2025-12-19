import { cn } from "@/lib/utils";

interface Version {
  id: string;
  webCover: string;
  webRecord?: string | null;
  mobileCover?: string | null;
  mobileRecord?: string | null;
}

interface VersionViewerProps {
  version: Version;
  viewMode: "web" | "mobile";
  hasMobileContent: boolean;
  onViewModeChange: (mode: "web" | "mobile") => void;
}

export function VersionViewer({
  version,
  viewMode,
  hasMobileContent,
  onViewModeChange,
}: VersionViewerProps) {
  // Get current content based on view mode
  const cover = viewMode === "mobile" ? version.mobileCover : version.webCover;
  const record =
    viewMode === "mobile" ? version.mobileRecord : version.webRecord;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-4xl rounded-xl bg-muted/50 p-4">
          {/* View mode toggle */}
          <div className="absolute top-4 right-4 z-10 flex rounded-lg bg-background/80 p-1 shadow-sm backdrop-blur-sm">
            <button
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors",
                viewMode === "web"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onViewModeChange("web")}
              title="Web view"
              type="button"
            >
              <span className="i-hugeicons-computer" />
            </button>
            {hasMobileContent && (
              <button
                className={cn(
                  "flex size-8 items-center justify-center rounded-md transition-colors",
                  viewMode === "mobile"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onViewModeChange("mobile")}
                title="Mobile view"
                type="button"
              >
                <span className="i-hugeicons-smart-phone-01" />
              </button>
            )}
          </div>

          {/* Content */}
          <div
            className={cn(
              "mx-auto overflow-hidden rounded-lg shadow-lg",
              viewMode === "mobile" ? "max-w-xs" : "max-w-3xl"
            )}
          >
            {record ? (
              <video
                autoPlay
                className="w-full"
                controls
                loop
                muted
                playsInline
                poster={cover ?? undefined}
              >
                <source src={record} type="video/mp4" />
              </video>
            ) : cover ? (
              <img alt="Page screenshot" className="w-full" src={cover} />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
                <span className="i-hugeicons-image-not-found-01 text-4xl" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
