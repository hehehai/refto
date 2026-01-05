import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  value: string;
  type: string;
  description: string | null;
}

interface FilterTagsTabProps {
  tags: Tag[];
  type: "category" | "section" | "style";
  onTagClick: (tagValue: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function FilterTagsTab({
  tags,
  type,
  onTagClick,
  isLoading = false,
  className,
}: FilterTagsTabProps) {
  // Show skeleton loading state
  if (isLoading) {
    const widths = [16, 20, 14, 18, 22, 15, 17, 19];

    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {widths.map((width, i) => (
          <Skeleton
            className="h-7 rounded-full"
            key={i}
            style={{ width: `${width * 4}px` }}
          />
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
      >
        <span className="i-hugeicons-folder-open size-12 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground text-sm">
          No{" "}
          {type === "category"
            ? "categories"
            : type === "section"
              ? "sections"
              : "styles"}{" "}
          found
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <Badge
          className="cursor-pointer px-3 py-1.5 transition-colors hover:bg-primary hover:text-primary-foreground"
          key={tag.id}
          onClick={() => onTagClick(tag.value)}
          title={tag.description ?? undefined}
          variant="outline"
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
