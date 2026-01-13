import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { orpc } from "@/lib/orpc";

type TagType = "category" | "section" | "style";

interface Tag {
  id: string;
  name: string;
  type: TagType;
}

const TAG_TYPE_VARIANTS: Record<TagType, "default" | "secondary" | "outline"> =
  {
    category: "default",
    section: "secondary",
    style: "outline",
  };

interface SiteDetailViewProps {
  site: {
    logo: string;
    title: string;
    url: string;
    description: string;
    tags?: Tag[];
    tagIds?: string[];
    rating: number;
    isPinned: boolean;
  };
}

export function SiteDetailView({ site }: SiteDetailViewProps) {
  // Fetch tags by IDs if only tagIds are provided
  const { data: fetchedTags } = useQuery(
    orpc.panel.tag.listByIds.queryOptions({
      input: { ids: site.tagIds ?? [] },
      queryKey: ["tags-by-ids", site.tagIds],
      enabled: !site.tags && !!site.tagIds && site.tagIds.length > 0,
    })
  );

  // Use provided tags or fetched tags
  const displayTags: Tag[] = site.tags ?? fetchedTags ?? [];

  return (
    <div className="space-y-4">
      {/* Logo */}
      <div>
        <span className="mb-1.5 block font-medium text-muted-foreground text-xs">
          Logo
        </span>
        {site.logo ? (
          <img
            alt={site.title}
            className="size-16 rounded-lg object-cover dark:bg-foreground"
            src={site.logo}
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-lg bg-muted">
            <span className="i-hugeicons-globe size-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <span className="mb-1 block font-medium text-muted-foreground text-xs">
          Title
        </span>
        <p className="font-medium">{site.title}</p>
      </div>

      {/* URL */}
      <div>
        <span className="mb-1 block font-medium text-muted-foreground text-xs">
          URL
        </span>
        <a
          className="text-primary text-sm hover:underline"
          href={site.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          {site.url}
        </a>
      </div>

      {/* Description */}
      <div>
        <span className="mb-1 block font-medium text-muted-foreground text-xs">
          Description
        </span>
        <p className="text-sm">{site.description || "-"}</p>
      </div>

      {/* Tags */}
      <div>
        <span className="mb-1.5 block font-medium text-muted-foreground text-xs">
          Tags
        </span>
        {displayTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {displayTags.map((tag) => (
              <Badge key={tag.id} variant={TAG_TYPE_VARIANTS[tag.type]}>
                {tag.name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </div>

      {/* Rating */}
      <div>
        <span className="mb-1 block font-medium text-muted-foreground text-xs">
          Rating
        </span>
        <Rating disabled value={site.rating} />
      </div>

      {/* Pin Status */}
      <div>
        <span className="mb-1 block font-medium text-muted-foreground text-xs">
          Status
        </span>
        {site.isPinned ? (
          <Badge variant="default">
            <span className="i-hugeicons-pin mr-1 size-3" />
            Pinned
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">Not pinned</span>
        )}
      </div>
    </div>
  );
}
