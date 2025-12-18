import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { SortableColumnHeader } from "@/components/shared/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { userDetailSheet } from "@/lib/sheets";
import { SubmitSiteRowActions } from "./row-actions";
import type { SubmitSiteRow, SubmitSiteStatus } from "./types";

interface CreateColumnsOptions {
  status: SubmitSiteStatus;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  onSortChange?: (
    sortBy: "createdAt" | "updatedAt",
    order: "asc" | "desc"
  ) => void;
}

// Submitter cell with click to open sheet
function SubmitterCell({ submission }: { submission: SubmitSiteRow }) {
  const handleClick = () => {
    if (submission.userId) {
      userDetailSheet.openWithPayload({ userId: submission.userId });
    }
  };

  if (!submission.userId) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="size-8">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-sm">Anonymous</span>
          <span className="text-muted-foreground text-xs">
            {submission.email}
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      className="flex items-center gap-2 text-left hover:opacity-80"
      onClick={handleClick}
      type="button"
    >
      <Avatar className="size-8">
        <AvatarFallback>{submission.userName?.charAt(0) ?? "?"}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium">{submission.userName}</span>
        <span className="text-muted-foreground text-xs">
          {submission.email}
        </span>
      </div>
    </button>
  );
}

export function createSubmitSiteColumns(
  options: CreateColumnsOptions
): ColumnDef<SubmitSiteRow>[] {
  const { status, sortBy, sortOrder, onSortChange } = options;
  const showStatus = status === "ALL";

  const columns: ColumnDef<SubmitSiteRow>[] = [
    // Submitter column
    {
      accessorKey: "submitter",
      header: "Submitter",
      size: 180,
      cell: ({ row }) => <SubmitterCell submission={row.original} />,
    },
    // Site info column
    {
      accessorKey: "siteInfo",
      header: "Site",
      size: 280,
      cell: ({ row }) => {
        const { siteUrl, siteTitle, siteDescription } = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <a
              className="max-w-65 truncate font-medium hover:underline"
              href={siteUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {siteTitle}
            </a>
            <span className="max-w-65 truncate text-muted-foreground text-xs">
              {siteUrl}
            </span>
            {siteDescription && (
              <Tooltip>
                <TooltipTrigger>
                  <p className="line-clamp-1 cursor-help text-muted-foreground text-xs">
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

  // PENDING tab: show reject reason badge if previously rejected
  if (status === "PENDING") {
    columns.push({
      accessorKey: "previousReject",
      header: "History",
      size: 120,
      cell: ({ row }) => {
        const { rejectReason, rejectedAt } = row.original;
        if (!rejectReason) return null;
        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge className="text-xs" variant="outline">
                Previously Rejected
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium">Rejected at:</p>
              <p className="text-xs">
                {rejectedAt ? new Date(rejectedAt).toLocaleString() : "-"}
              </p>
              <p className="mt-1 font-medium">Reason:</p>
              <p className="text-xs">{rejectReason}</p>
            </TooltipContent>
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

  // REJECTED tab: show reject reason and time
  if (status === "REJECTED") {
    columns.push({
      accessorKey: "rejectReason",
      header: "Reject Reason",
      size: 150,
      cell: ({ row }) => {
        const { rejectReason } = row.original;
        if (!rejectReason) return "-";
        return (
          <Tooltip>
            <TooltipTrigger>
              <span className="line-clamp-1 cursor-help text-sm">
                {rejectReason}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{rejectReason}</TooltipContent>
          </Tooltip>
        );
      },
    });
    columns.push({
      accessorKey: "rejectedAt",
      header: "Rejected At",
      size: 120,
      cell: ({ row }) => {
        const rejectedAt = row.original.rejectedAt;
        return (
          <span className="text-muted-foreground text-sm">
            {rejectedAt
              ? formatDistanceToNow(new Date(rejectedAt), { addSuffix: true })
              : "-"}
          </span>
        );
      },
    });
  }

  // Created at column with sorting
  columns.push({
    accessorKey: "createdAt",
    header: () => (
      <SortableColumnHeader
        onSort={() => {
          const next =
            sortBy === "createdAt" && sortOrder === "desc" ? "asc" : "desc";
          onSortChange?.("createdAt", next);
        }}
        sortDirection={sortBy === "createdAt" ? (sortOrder ?? null) : null}
        title="Created"
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
  });

  // Actions column
  columns.push({
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    size: 180,
    enableSorting: false,
    cell: ({ row }) => <SubmitSiteRowActions submission={row.original} />,
  });

  return columns;
}
