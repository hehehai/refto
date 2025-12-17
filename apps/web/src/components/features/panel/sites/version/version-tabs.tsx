import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Version {
  id: string;
  versionDate: Date;
  versionNote?: string | null;
}

interface VersionTabsProps {
  versions: Version[];
  activeVersionId: string | null;
  onVersionSelect: (versionId: string) => void;
  onAddVersion: () => void;
  onEditVersion: (version: Version) => void;
  onDeleteVersion: (version: Version) => void;
  disabled?: boolean;
}

export function VersionTabs({
  versions,
  activeVersionId,
  onVersionSelect,
  onAddVersion,
  onEditVersion,
  onDeleteVersion,
  disabled = false,
}: VersionTabsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex w-36 shrink-0 flex-col border-r">
      {/* Header with Add button */}
      <div className="p-2">
        <Button
          className="w-full justify-between"
          disabled={disabled}
          onClick={onAddVersion}
          variant="secondary"
        >
          <span className="font-medium text-muted-foreground text-xs">
            Add Versions
          </span>
          <span className="i-hugeicons-plus-sign size-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="p-3 text-center text-muted-foreground text-xs">
            No versions yet
          </div>
        ) : (
          versions.map((version) => (
            <div
              className="relative"
              key={version.id}
              onMouseEnter={() => setHoveredId(version.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <button
                className={cn(
                  "flex w-full flex-col gap-0.5 p-1.5 text-left transition-colors",
                  "hover:bg-muted/50",
                  activeVersionId === version.id
                    ? "border-primary border-l-2 bg-muted"
                    : "border-transparent border-l-2"
                )}
                disabled={disabled}
                onClick={() => onVersionSelect(version.id)}
                type="button"
              >
                <span className="font-medium text-xs">
                  {format(new Date(version.versionDate), "MMM d, yyyy")}
                </span>
                {version.versionNote && (
                  <span className="max-w-full truncate text-muted-foreground text-xs">
                    {version.versionNote}
                  </span>
                )}
              </button>

              {/* Edit/Delete icons on hover */}
              {hoveredId === version.id && !disabled && (
                <div className="absolute top-1 right-1 flex items-center gap-0.5 rounded bg-background shadow-sm">
                  <button
                    className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditVersion(version);
                    }}
                    type="button"
                  >
                    <span className="i-hugeicons-edit-02 size-3" />
                  </button>
                  <button
                    className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteVersion(version);
                    }}
                    type="button"
                  >
                    <span className="i-hugeicons-delete-03 size-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
