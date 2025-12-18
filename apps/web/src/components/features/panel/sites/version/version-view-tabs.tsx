import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface Version {
  id: string;
  versionDate: Date;
  versionNote?: string | null;
}

interface VersionViewTabsProps {
  versions: Version[];
  activeVersionId: string | null;
  onVersionSelect: (versionId: string) => void;
}

export function VersionViewTabs({
  versions,
  activeVersionId,
  onVersionSelect,
}: VersionViewTabsProps) {
  return (
    <div className="flex w-36 shrink-0 flex-col border-r">
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="p-3 text-center text-muted-foreground text-xs">
            No versions yet
          </div>
        ) : (
          versions.map((version) => (
            <button
              className={cn(
                "flex w-full flex-col gap-0.5 p-1.5 text-left transition-colors",
                "hover:bg-muted/50",
                activeVersionId === version.id
                  ? "border-primary border-l-2 bg-muted"
                  : "border-transparent border-l-2"
              )}
              key={version.id}
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
          ))
        )}
      </div>
    </div>
  );
}
