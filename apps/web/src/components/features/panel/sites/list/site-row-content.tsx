import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { siteDetailSheet } from "@/lib/sheets";
import type { SiteRow } from "../common/types";

export function SiteRowContent({ site }: { site: SiteRow }) {
  const { data: stats, isLoading } = useQuery(
    orpc.panel.site.getStats.queryOptions({
      input: { id: site.id },
    })
  );

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
      <div className="grid grid-cols-4 gap-4">
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
        <div>
          <h4 className="mb-1 font-medium text-muted-foreground text-xs uppercase">
            Pages
          </h4>
          {isLoading ? (
            <Skeleton className="h-7 w-8" />
          ) : (
            <p className="font-semibold text-lg">{stats?.pagesCount ?? 0}</p>
          )}
        </div>
        <div>
          <h4 className="mb-1 font-medium text-muted-foreground text-xs uppercase">
            Versions
          </h4>
          {isLoading ? (
            <Skeleton className="h-7 w-8" />
          ) : (
            <p className="font-semibold text-lg">{stats?.versionsCount ?? 0}</p>
          )}
        </div>
      </div>

      {/* Pages */}
      <div>
        <h4 className="mb-1.5 font-medium text-muted-foreground text-xs uppercase">
          Pages
        </h4>
        {isLoading ? (
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        ) : stats?.pages && stats.pages.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {stats.pages.map((page) => (
              <Badge
                className="cursor-pointer gap-1"
                key={page.id}
                onClick={() => {
                  siteDetailSheet.openWithPayload({
                    siteId: site.id,
                    pageId: page.id,
                  });
                }}
                variant="secondary"
              >
                {page.isDefault && (
                  <span className="i-hugeicons-star size-3 text-yellow-500" />
                )}
                {page.title}
                <span className="text-muted-foreground">
                  ({page.versionsCount})
                </span>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No pages</p>
        )}
      </div>

      {/* Tags */}
      {site.tags && site.tags.length > 0 && (
        <div>
          <h4 className="mb-1 font-medium text-muted-foreground text-xs uppercase">
            All Tags
          </h4>
          <p className="text-sm">{site.tags.map((t) => t.name).join(", ")}</p>
        </div>
      )}
    </div>
  );
}
