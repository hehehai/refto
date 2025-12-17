import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { SortableColumnHeader } from "@/components/shared/data-table";
import { createSelectionColumn } from "@/components/shared/data-table/column-helpers";
import { CreatorCell } from "@/components/shared/data-table/common-cells";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SiteRow } from "../common/types";
import { SiteRowActions } from "./row-actions";

interface CreateSiteColumnsOptions {
  sortBy?: "createdAt" | "visits";
  sortOrder?: "asc" | "desc";
  onSortChange?: (
    sortBy: "createdAt" | "visits",
    order: "asc" | "desc"
  ) => void;
}

export function createSiteColumns(
  options?: CreateSiteColumnsOptions
): ColumnDef<SiteRow>[] {
  return [
    createSelectionColumn<SiteRow>(),
    {
      accessorKey: "site",
      header: "Site",
      size: 280,
      cell: ({ row }) => {
        const { title, logo, url, isPinned } = row.original;
        return (
          <div className="flex items-center gap-3">
            {logo ? (
              <img
                alt={title}
                className="size-9 rounded-lg object-cover"
                src={logo}
              />
            ) : (
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <span className="i-hugeicons-globe size-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="max-w-56 truncate font-medium">{title}</span>
              <div className="flex items-center gap-1">
                <a
                  className="max-w-45 truncate text-muted-foreground text-xs hover:underline"
                  href={url}
                  target="_blank"
                >
                  {url}
                </a>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <a
                        className="flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        href={url}
                        onClick={(e) => e.stopPropagation()}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <span className="i-hugeicons-link-square-01 size-3.5" />
                      </a>
                    }
                  />
                  <TooltipContent>Visit site</TooltipContent>
                </Tooltip>
                {isPinned && (
                  <Tooltip>
                    <TooltipTrigger
                      render={<span className="i-hugeicons-pin size-3.5" />}
                    />
                    <TooltipContent>Pined</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      size: 160,
      cell: ({ row }) => {
        const tags = row.original.tags;
        if (!tags || tags.length === 0) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }
        const displayTags = tags.slice(0, 2);
        const remainingCount = tags.length - 2;
        return (
          <div className="flex flex-wrap gap-1">
            {displayTags.map((tag) => (
              <Badge className="text-xs" key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="text-xs" variant="outline">
                    +{remainingCount}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{tags.slice(2).join(", ")}</TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "rating",
      header: "Rating",
      size: 80,
      cell: ({ row }) => {
        const rating = row.original.rating ?? 0;
        return (
          <div className="flex items-center gap-1">
            <span className="i-hugeicons-star size-4 text-yellow-500" />
            <span className="text-sm">{rating.toFixed(1)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "visits",
      header: () => (
        <SortableColumnHeader
          onSort={() => {
            const isSortedByVisits = options?.sortBy === "visits";
            const next =
              isSortedByVisits && options?.sortOrder === "desc"
                ? "asc"
                : "desc";
            options?.onSortChange?.("visits", next);
          }}
          sortDirection={
            options?.sortBy === "visits" ? (options?.sortOrder ?? null) : null
          }
          title="Visits"
        />
      ),
      size: 80,
      cell: ({ row }) => {
        const visits = row.original.visits;
        return <span className="text-sm">{visits.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <SortableColumnHeader
          onSort={() => {
            const isSortedByCreatedAt = options?.sortBy === "createdAt";
            const next =
              isSortedByCreatedAt && options?.sortOrder === "desc"
                ? "asc"
                : "desc";
            options?.onSortChange?.("createdAt", next);
          }}
          sortDirection={
            options?.sortBy === "createdAt"
              ? (options?.sortOrder ?? null)
              : null
          }
          title="Created At"
        />
      ),
      size: 120,
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return (
          <span className="text-muted-foreground text-sm">
            {createdAt
              ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
              : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "creator",
      header: "Creator",
      size: 120,
      cell: ({ row }) => {
        const { createdById, creatorName, creatorImage } = row.original;
        if (!createdById) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }
        return (
          <CreatorCell
            createdById={createdById}
            creatorImage={creatorImage}
            creatorName={creatorName}
          />
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      size: 170,
      enableSorting: false,
      cell: ({ row }) => <SiteRowActions site={row.original} />,
    },
  ];
}
