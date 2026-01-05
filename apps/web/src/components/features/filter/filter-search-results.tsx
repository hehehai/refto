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

interface FilterSearchResultsProps {
  tags: SearchTag[];
  sites: SearchSite[];
  onTagClick: (tagValue: string) => void;
  onSiteClick: (siteSlug: string) => void;
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
  onTagClick,
  onSiteClick,
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
    </div>
  );
}
