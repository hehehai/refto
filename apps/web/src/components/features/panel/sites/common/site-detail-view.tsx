import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";

interface SiteDetailViewProps {
  site: {
    logo: string;
    title: string;
    url: string;
    description: string;
    tags: string[];
    rating: number;
    isPinned: boolean;
  };
}

export function SiteDetailView({ site }: SiteDetailViewProps) {
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
            className="size-16 rounded-lg object-cover"
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
        {site.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {site.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
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
