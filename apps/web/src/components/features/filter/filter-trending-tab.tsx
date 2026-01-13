import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TrendingTag {
  id: string;
  name: string;
  value: string;
  type: string;
  tipMedia: string | null;
  usageCount: number;
}

interface TrendingSite {
  id: string;
  title: string;
  slug: string;
  logo: string;
  viewCount: number;
}

interface TrendingData {
  sites: TrendingSite[];
  categories: TrendingTag[];
  sections: TrendingTag[];
  styles: TrendingTag[];
}

interface FilterTrendingTabProps {
  data?: TrendingData;
  onTagClick: (tagValue: string) => void;
  onSiteClick: (siteSlug: string) => void;
  className?: string;
}

export function FilterTrendingTab({
  data,
  onTagClick,
  onSiteClick,
  className,
}: FilterTrendingTabProps) {
  if (!data) {
    return (
      <div className={cn("space-y-5", className)}>
        {/* Hot Sites skeleton */}
        <section>
          <div className="mb-3 grid grid-cols-6 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton className="aspect-square size-14 rounded-xl" key={i} />
            ))}
          </div>
        </section>

        {/* Categories skeleton */}
        <section>
          <Skeleton className="mb-3 h-4 w-20" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="space-y-2" key={i}>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </section>

        {/* Sections skeleton */}
        <section>
          <Skeleton className="mb-3 h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            {[20, 14, 18, 16, 22, 15].map((width, i) => (
              <Skeleton
                className="h-7 rounded-full"
                key={i}
                style={{ width: `${width * 4}px` }}
              />
            ))}
          </div>
        </section>

        {/* Styles skeleton */}
        <section>
          <Skeleton className="mb-3 h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            {[18, 16, 14, 20, 17, 19].map((width, i) => (
              <Skeleton
                className="h-7 rounded-full"
                key={i}
                style={{ width: `${width * 4}px` }}
              />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      {/* Hot Sites */}
      {data.sites.length > 0 && (
        <section>
          <div className="mb-3 grid grid-cols-6 gap-3">
            {data.sites.map((site) => (
              <button
                className="group flex aspect-square size-14 items-center justify-center rounded-xl border bg-muted/30 transition-colors hover:border-primary hover:bg-muted"
                key={site.id}
                onClick={() => onSiteClick(site.slug)}
                title={site.title}
                type="button"
              >
                <img
                  alt={site.title}
                  className="size-11 rounded-lg object-contain dark:bg-foreground"
                  src={site.logo}
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Hot Categories */}
      {data.categories.length > 0 && (
        <section>
          <h3 className="mb-3 text-muted-foreground text-sm">Categories</h3>
          <div className="grid grid-cols-4 gap-3">
            {data.categories.map((tag) => (
              <button
                className="flex flex-col items-start gap-2 rounded-xl border bg-muted/30 p-2 text-left transition-colors hover:border-primary hover:bg-muted"
                key={tag.id}
                onClick={() => onTagClick(tag.value)}
                type="button"
              >
                <span className="font-medium text-sm">{tag.name}</span>
                {tag.tipMedia ? (
                  <img
                    alt={tag.name}
                    className="h-16 w-full rounded-lg object-cover"
                    src={tag.tipMedia}
                  />
                ) : (
                  <div className="h-16 w-full rounded-lg bg-muted/50" />
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Sections */}
      {data.sections.length > 0 && (
        <section>
          <h3 className="mb-3 text-muted-foreground text-sm">Sections</h3>
          <div className="flex flex-wrap gap-2">
            {data.sections.map((tag) => (
              <Badge
                className="cursor-pointer px-3 py-1.5 transition-colors hover:bg-primary hover:text-primary-foreground"
                key={tag.id}
                onClick={() => onTagClick(tag.value)}
                variant="outline"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Styles */}
      {data.styles.length > 0 && (
        <section>
          <h3 className="mb-3 text-muted-foreground text-sm">Styles</h3>
          <div className="flex flex-wrap gap-2">
            {data.styles.map((tag) => (
              <Badge
                className="cursor-pointer px-3 py-1.5 transition-colors hover:bg-primary hover:text-primary-foreground"
                key={tag.id}
                onClick={() => onTagClick(tag.value)}
                variant="outline"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
