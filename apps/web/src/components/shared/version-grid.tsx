import InViewLoader from "@/components/shared/in-view-loader";
import { VersionCard } from "@/components/shared/version-card";

interface VersionItem {
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
}

interface VersionGridProps {
  items: VersionItem[];
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  onLikeChange?: (versionId: string, liked: boolean) => void;
}

export function VersionGrid({
  items,
  hasMore = false,
  isLoading = false,
  onLoadMore,
  onLikeChange,
}: VersionGridProps) {
  if (items.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <span className="i-hugeicons-image-not-found-01 text-4xl" />
        <p className="mt-2">No items found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <VersionCard
            key={item.version.id}
            liked={item.liked}
            onLikeChange={(liked) => onLikeChange?.(item.version.id, liked)}
            page={item.page}
            site={item.site}
            version={item.version}
          />
        ))}
      </div>

      {(hasMore || isLoading) && onLoadMore && (
        <InViewLoader
          className="flex items-center justify-center py-8"
          loadCondition={hasMore && !isLoading}
          loadFn={onLoadMore}
        >
          {isLoading && (
            <span className="i-hugeicons-loading-01 animate-spin text-2xl text-muted-foreground" />
          )}
        </InViewLoader>
      )}
    </div>
  );
}
