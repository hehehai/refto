import { LikeButton } from "@/components/shared/like-button";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { MarkerSelectionControls } from "./marker-selection-controls";

interface Page {
  id: string;
  title: string;
  url: string;
  versions: {
    id: string;
    versionDate: Date;
    versionNote?: string | null;
  }[];
}

interface SitePageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  pages: Page[];
  currentPageId: string;
  currentVersionId: string;
  liked: boolean;
  activeDetailTab: "record" | "refs";
  markersCount: number;
  showDetailTabs: boolean;
  onDetailTabChange: (tab: "record" | "refs") => void;
  onPageChange: (pageId: string) => void;
  onVersionChange: (versionId: string) => void;
  onLikeChange: (liked: boolean) => void;
  isMarkerSelectionMode?: boolean;
  selectedMarkerCount?: number;
  onToggleMarkerSelectionMode?: () => void;
  onDownloadSelectedMarkers?: () => void;
}

export function SitePageHeader({
  pages,
  currentPageId,
  currentVersionId,
  liked,
  activeDetailTab,
  markersCount,
  showDetailTabs,
  isMarkerSelectionMode = false,
  selectedMarkerCount = 0,
  onToggleMarkerSelectionMode,
  onDownloadSelectedMarkers,
  onDetailTabChange,
  onPageChange,
  onVersionChange,
  onLikeChange,
  className,
  ...props
}: SitePageHeaderProps) {
  const currentPage = pages.find((p) => p.id === currentPageId);
  const currentVersion = currentPage?.versions.find(
    (v) => v.id === currentVersionId
  );

  // Format date for display
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Handle version change with null check
  const handleVersionChange = (value: string | null) => {
    if (value) {
      onVersionChange(value);
    }
  };

  return (
    <header className={cn(className)} {...props}>
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        {/* Page tabs + Detail tabs */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Tabs
            className="flex-row gap-0"
            onValueChange={onPageChange}
            value={currentPageId}
          >
            <TabsList className="overflow-x-auto">
              {pages.map((page) => (
                <TabsTrigger className="px-4" key={page.id} value={page.id}>
                  {page.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {showDetailTabs && (
            <>
              <div className="h-6 w-px bg-border" />
              <Tabs
                className="flex-row gap-0"
                onValueChange={(value) =>
                  onDetailTabChange(value as "record" | "refs")
                }
                value={activeDetailTab}
              >
                <TabsList>
                  <TabsTrigger value="record">Record</TabsTrigger>
                  <TabsTrigger value="refs">
                    Refs
                    <span className="ml-1 text-muted-foreground text-xs">
                      {markersCount}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </>
          )}
        </div>

        {/* Version select and actions */}
        <div className="flex items-center gap-2">
          {markersCount > 0 &&
            activeDetailTab === "refs" &&
            onToggleMarkerSelectionMode && (
              <MarkerSelectionControls
                isSelectionMode={isMarkerSelectionMode}
                onDownloadSelectedMarkers={onDownloadSelectedMarkers}
                onToggleSelectionMode={onToggleMarkerSelectionMode}
                selectedMarkerCount={selectedMarkerCount}
              />
            )}
          {/* Version select */}
          {currentPage && currentPage.versions.length > 0 && (
            <Select
              onValueChange={handleVersionChange}
              value={currentVersionId}
            >
              <SelectTrigger className="w-45">
                <SelectValue>
                  {currentVersion
                    ? formatDate(currentVersion?.versionDate)
                    : ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {currentPage.versions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    <div className="flex flex-col">
                      <span>{formatDate(version.versionDate)}</span>
                      {version.versionNote && (
                        <p className="max-w-36 truncate text-muted-foreground text-xs">
                          {version.versionNote ||
                            formatDate(version.versionDate)}
                        </p>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Separator */}
          <div className="h-6 w-px bg-border" />

          {/* Page URL button */}
          {currentPage && (
            <Button
              nativeButton={false}
              render={
                <a
                  href={currentPage.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Visit page"
                >
                  <span className="i-hugeicons-link-square-01" />
                </a>
              }
              size="icon"
              variant="outline"
            />
          )}

          {/* Like button */}
          <LikeButton
            liked={liked}
            onLikeChange={onLikeChange}
            variant="outline"
            versionId={currentVersionId}
          />
        </div>
      </div>
    </header>
  );
}
