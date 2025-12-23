import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SubmitRowActions } from "./row-actions";
import type { SubmitSiteRow, SubmitStatus } from "./types";

interface CreateColumnsOptions {
  status: SubmitStatus;
  onEdit: (submission: SubmitSiteRow) => void;
}

export function createSubmitColumns(
  options: CreateColumnsOptions
): ColumnDef<SubmitSiteRow>[] {
  const { status, onEdit } = options;
  const showStatus = status === "ALL";

  const columns: ColumnDef<SubmitSiteRow>[] = [
    // Site info column
    {
      accessorKey: "siteInfo",
      header: "Site",
      size: 300,
      cell: ({ row }) => {
        const { siteUrl, siteTitle, siteDescription } = row.original;
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="max-w-60 truncate font-medium">{siteTitle}</span>
              <a
                className="flex shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
                href={siteUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="i-hugeicons-link-02 size-3.5" />
              </a>
            </div>
            {siteDescription && (
              <Tooltip>
                <TooltipTrigger>
                  <p className="line-clamp-1 cursor-help text-left text-muted-foreground text-xs">
                    {siteDescription}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {siteDescription}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  // Status column (only for ALL tab)
  if (showStatus) {
    columns.push({
      accessorKey: "status",
      header: "Status",
      size: 100,
      cell: ({ row }) => {
        const rowStatus = row.original.status;
        const variants: Record<
          string,
          "default" | "secondary" | "destructive"
        > = {
          PENDING: "secondary",
          APPROVED: "default",
          REJECTED: "destructive",
        };
        return <Badge variant={variants[rowStatus]}>{rowStatus}</Badge>;
      },
    });
  }

  // REJECTED tab: show reject reason
  if (status === "REJECTED") {
    columns.push({
      accessorKey: "rejectReason",
      header: "Reject Reason",
      size: 180,
      cell: ({ row }) => {
        const { rejectReason } = row.original;
        if (!rejectReason) return "-";
        return (
          <Tooltip>
            <TooltipTrigger>
              <span className="line-clamp-2 cursor-help text-sm">
                {rejectReason}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{rejectReason}</TooltipContent>
          </Tooltip>
        );
      },
    });
  }

  // APPROVED tab: show approved time
  if (status === "APPROVED") {
    columns.push({
      accessorKey: "approvedAt",
      header: "Approved At",
      size: 120,
      cell: ({ row }) => {
        const approvedAt = row.original.approvedAt;
        return (
          <span className="text-muted-foreground text-sm">
            {approvedAt
              ? formatDistanceToNow(new Date(approvedAt), { addSuffix: true })
              : "-"}
          </span>
        );
      },
    });
  }

  // Created at column
  columns.push({
    accessorKey: "createdAt",
    header: "Created",
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
  });

  // Actions column
  columns.push({
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    size: 160,
    enableSorting: false,
    cell: ({ row }) => (
      <SubmitRowActions onEdit={onEdit} submission={row.original} />
    ),
  });

  return columns;
}
