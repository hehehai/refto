import { cn } from "@/lib/utils";

interface FilterRecentSearchesProps {
  searches: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  className?: string;
}

export function FilterRecentSearches({
  searches,
  onSelect,
  onRemove,
  className,
}: FilterRecentSearchesProps) {
  if (searches.length === 0) {
    return null;
  }

  return (
    <div className={cn("mb-4", className)}>
      <h3 className="sr-only mb-2 font-medium text-muted-foreground text-xs">
        Recent Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {searches.map((query) => (
          <div
            className="group flex items-center gap-1 rounded-full border bg-muted/50 py-1 pr-1 pl-3 text-sm transition-colors hover:bg-muted"
            key={query}
          >
            <button
              className="hover:text-foreground"
              onClick={() => onSelect(query)}
              type="button"
            >
              {query}
            </button>
            <button
              className="flex size-5 items-center justify-center rounded-full text-muted-foreground opacity-50 transition-opacity hover:bg-background hover:text-foreground group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(query);
              }}
              type="button"
            >
              <span className="i-hugeicons-cancel-01 size-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
