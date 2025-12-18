interface VersionViewData {
  siteOG: string | null;
  webCover: string;
  webRecord: string | null;
  mobileCover: string | null;
  mobileRecord: string | null;
}

interface VersionViewProps {
  value: VersionViewData;
}

export function VersionView({ value }: VersionViewProps) {
  return (
    <div className="space-y-6">
      {/* OG Image */}
      {value.siteOG && (
        <div>
          <h4 className="mb-2 font-medium text-muted-foreground text-xs">
            OG Image
          </h4>
          <img
            alt="Open Graph preview"
            className="max-w-xs rounded-lg object-cover"
            src={value.siteOG}
          />
        </div>
      )}

      {/* Web Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Web Version</h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Web Cover */}
          <div>
            <span className="mb-2 block text-muted-foreground text-xs">
              Web Cover
            </span>
            {value.webCover ? (
              <img
                alt="Web cover preview"
                className="aspect-video w-full rounded-lg object-cover"
                src={value.webCover}
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
                <span className="text-muted-foreground text-xs">No cover</span>
              </div>
            )}
          </div>

          {/* Web Recording */}
          <div>
            <span className="mb-2 block text-muted-foreground text-xs">
              Web Recording
            </span>
            {value.webRecord ? (
              // biome-ignore lint/a11y/useMediaCaption: screen recordings don't need captions
              <video
                className="aspect-video w-full rounded-lg object-cover"
                controls
                src={value.webRecord}
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
                <span className="text-muted-foreground text-xs">No video</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Mobile Version</h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Mobile Cover */}
          <div>
            <span className="mb-2 block text-muted-foreground text-xs">
              Mobile Cover
            </span>
            {value.mobileCover ? (
              <img
                alt="Mobile cover preview"
                className="aspect-[9/16] w-32 rounded-lg object-cover"
                src={value.mobileCover}
              />
            ) : (
              <div className="flex aspect-[9/16] w-32 items-center justify-center rounded-lg bg-muted">
                <span className="text-muted-foreground text-xs">No cover</span>
              </div>
            )}
          </div>

          {/* Mobile Recording */}
          <div>
            <span className="mb-2 block text-muted-foreground text-xs">
              Mobile Recording
            </span>
            {value.mobileRecord ? (
              // biome-ignore lint/a11y/useMediaCaption: screen recordings don't need captions
              <video
                className="aspect-[9/16] w-32 rounded-lg object-cover"
                controls
                src={value.mobileRecord}
              />
            ) : (
              <div className="flex aspect-[9/16] w-32 items-center justify-center rounded-lg bg-muted">
                <span className="text-muted-foreground text-xs">No video</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
