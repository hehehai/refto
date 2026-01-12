import { cn } from "@/lib/utils";

interface SearchTag {
  id: string;
  name: string;
  value: string;
  type: string;
}

interface SearchSite {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  logo: string;
}

interface SearchMarker {
  id: string;
  text: string | null;
  time: number;
  versionDate: Date | string;
  pageTitle: string;
  pageSlug: string;
  siteTitle: string;
  siteSlug: string;
}

interface FilterSearchResultsProps {
  tags: SearchTag[];
  sites: SearchSite[];
  markers: SearchMarker[];
  onTagClick: (tagValue: string) => void;
  onSiteClick: (siteSlug: string) => void;
  onMarkerClick: (marker: SearchMarker) => void;
  className?: string;
}

const tagTypeLabels: Record<string, string> = {
  category: "Category",
  section: "Section",
  style: "Style",
};

const tagTypeIcons: Record<string, string> = {
  category: "i-hugeicons-folder-01",
  section: "i-hugeicons-layout-grid",
  style: "i-hugeicons-paint-brush-01",
};

export function FilterSearchResults({
  tags,
  sites,
  markers,
  onTagClick,
  onSiteClick,
  onMarkerClick,
  className,
}: FilterSearchResultsProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {/* Tags Results */}
      {tags.map((tag) => (
        <button
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted"
          key={tag.id}
          onClick={() => onTagClick(tag.value)}
          type="button"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <span
              className={cn(
                tagTypeIcons[tag.type] ?? "i-hugeicons-tag-01",
                "size-5"
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium">{tag.name}</div>
            <div className="text-muted-foreground text-sm">
              {tagTypeLabels[tag.type] ?? tag.type}
            </div>
          </div>
        </button>
      ))}

      {/* Sites Results */}
      {sites.map((site) => (
        <button
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted"
          key={site.id}
          onClick={() => onSiteClick(site.slug)}
          type="button"
        >
          <img
            alt={site.title}
            className="size-10 rounded-lg object-contain"
            src={site.logo}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{site.title}</div>
            <div className="truncate text-muted-foreground text-sm">
              {site.description}
            </div>
          </div>
        </button>
      ))}

      {/* Marker Results */}
      {markers.map((marker) => (
        <button
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted"
          key={marker.id}
          onClick={() => onMarkerClick(marker)}
          type="button"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <span className="i-hugeicons-bookmark-01 size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">
              {marker.text ? `Marker · ${marker.text}` : "Marker · Untitled"}
            </div>
            <div className="truncate text-muted-foreground text-sm">
              {marker.siteTitle} · {marker.pageTitle} ·{" "}
              {new Date(marker.versionDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
