import { Bookmark02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { skipToken, useQuery } from "@tanstack/react-query";
import { MediaUpload } from "@/components/shared/media-upload";
import { TagSelect } from "@/components/shared/tag-select";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/lib/orpc";
import { videoMarkerDialog } from "@/lib/sheets";
import { cn } from "@/lib/utils";

interface VersionFormData {
  siteOG: string | null;
  webCover: string;
  webRecord: string | null;
  mobileCover: string | null;
  mobileRecord: string | null;
  tagIds: string[];
}

interface VersionFormProps {
  value: VersionFormData;
  onChange: (data: Partial<VersionFormData>) => void;
  disabled?: boolean;
  versionId?: string;
}

export function VersionForm({
  value,
  onChange,
  disabled = false,
  versionId,
}: VersionFormProps) {
  const { data: webMarkers = [] } = useQuery(
    orpc.panel.marker.list.queryOptions({
      input: versionId ? { versionId, recordType: "web" } : skipToken,
    })
  );
  const { data: mobileMarkers = [] } = useQuery(
    orpc.panel.marker.list.queryOptions({
      input: versionId ? { versionId, recordType: "mobile" } : skipToken,
    })
  );
  const hasWebMarkers = webMarkers.length > 0;
  const hasMobileMarkers = mobileMarkers.length > 0;

  const handleOpenMarkerDialog = (recordType: "web" | "mobile") => {
    if (!versionId) return;

    const videoUrl =
      recordType === "web" ? value.webRecord : value.mobileRecord;
    const coverUrl = recordType === "web" ? value.webCover : value.mobileCover;

    if (!videoUrl) return;

    videoMarkerDialog.openWithPayload({
      versionId,
      recordType,
      videoUrl,
      coverUrl: coverUrl ?? "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Tags */}
      <Field>
        <FieldLabel>Tags</FieldLabel>
        <TagSelect
          disabled={disabled}
          matchBy="id"
          onChange={(tagIds) => onChange({ tagIds })}
          value={value.tagIds}
        />
      </Field>

      {/* OG Image */}
      <Field>
        <FieldLabel>
          OG Image <span>1200x630 recommended</span>
        </FieldLabel>
        <MediaUpload
          aspectRatio="og"
          className="max-w-xs"
          disabled={disabled}
          mediaType="image"
          onChange={(url) => onChange({ siteOG: url })}
          value={value.siteOG}
        />
      </Field>

      {/* Web Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Web Version</h4>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <MediaUpload
              aspectRatio="cover"
              disabled={disabled}
              mediaType="image"
              onChange={(url) => onChange({ webCover: url ?? "" })}
              value={value.webCover}
            />
          </Field>
          <Field>
            <div className="relative">
              <MediaUpload
                aspectRatio="cover"
                disabled={disabled}
                extraTools={
                  value.webRecord &&
                  versionId && (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            className={cn(
                              hasWebMarkers &&
                                "text-primary ring-1 ring-primary/40"
                            )}
                            onClick={() => handleOpenMarkerDialog("web")}
                            size="icon"
                            variant="secondary"
                          />
                        }
                      >
                        <HugeiconsIcon icon={Bookmark02Icon} size={14} />
                      </TooltipTrigger>
                      <TooltipContent>
                        {hasWebMarkers ? "Markers set" : "Video Markers"}
                      </TooltipContent>
                    </Tooltip>
                  )
                }
                mediaType="video"
                onChange={(url) => onChange({ webRecord: url })}
                value={value.webRecord}
              />
            </div>
          </Field>
        </div>
      </div>

      {/* Mobile Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Mobile Version</h4>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <MediaUpload
              aspectRatio="mobile"
              disabled={disabled}
              mediaType="image"
              onChange={(url) => onChange({ mobileCover: url })}
              value={value.mobileCover}
            />
          </Field>
          <Field>
            <div className="relative">
              <MediaUpload
                aspectRatio="mobile"
                disabled={disabled}
                mediaType="video"
                onChange={(url) => onChange({ mobileRecord: url })}
                value={value.mobileRecord}
              />
              {value.mobileRecord && versionId && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        className={cn(
                          "absolute top-2 left-2 z-10",
                          hasMobileMarkers &&
                            "text-primary ring-1 ring-primary/40"
                        )}
                        onClick={() => handleOpenMarkerDialog("mobile")}
                        size="icon-xs"
                        variant="secondary"
                      />
                    }
                  >
                    <HugeiconsIcon icon={Bookmark02Icon} size={14} />
                  </TooltipTrigger>
                  <TooltipContent>
                    {hasMobileMarkers ? "Markers set" : "Video Markers"}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}
