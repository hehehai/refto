import { VersionCard } from "@/components/shared/version-card";
import type { FeedItem } from "./feed-types";

interface FeedListProps {
  items: FeedItem[];
  onLikeChange: (versionId: string, liked: boolean) => void;
}

export function FeedList({ items, onLikeChange }: FeedListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <VersionCard
          key={item.version.id}
          liked={item.liked}
          onLikeChange={(liked) => onLikeChange(item.version.id, liked)}
          page={item.page}
          site={item.site}
          version={item.version}
        />
      ))}
    </div>
  );
}
