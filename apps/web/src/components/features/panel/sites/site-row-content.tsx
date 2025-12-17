import type { SiteRow } from "./types";

export function SiteRowContent({ site }: { site: SiteRow }) {
  return (
    <div className="space-y-3 rounded-b-lg bg-muted/30 p-4">
      {/* Description */}
      {site.description && (
        <div>
          <h4 className="mb-1 font-medium text-muted-foreground text-xs uppercase">
            Description
          </h4>
          <p className="line-clamp-2 text-sm">{site.description}</p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="mb-1 font-medium text-muted-foreground text-xs uppercase">
            Visits
          </h4>
          <p className="font-semibold text-lg">
            {site.visits.toLocaleString()}
          </p>
        </div>
        <div>
          <h4 className="mb-1 font-medium text-muted-foreground text-xs uppercase">
            Rating
          </h4>
          <div className="flex items-center gap-1">
            <span className="i-hugeicons-star size-5 text-yellow-500" />
            <span className="font-semibold text-lg">
              {(site.rating ?? 0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {site.tags && site.tags.length > 0 && (
        <div>
          <h4 className="mb-1 font-medium text-muted-foreground text-xs uppercase">
            All Tags
          </h4>
          <p className="text-sm">{site.tags.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
