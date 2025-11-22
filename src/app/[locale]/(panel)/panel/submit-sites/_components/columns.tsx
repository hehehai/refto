"use client";

import { type SubmitSite, SubmitSiteStatus } from "@prisma/client";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { ClockIcon } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const statuses = [
  {
    value: SubmitSiteStatus.PENDING,
    label: "Pending",
    icon: ClockIcon,
  },
  {
    value: SubmitSiteStatus.APPROVED,
    label: "Approved",
    icon: CheckCircledIcon,
  },
  {
    value: SubmitSiteStatus.REJECTED,
    label: "Rejected",
    icon: CrossCircledIcon,
  },
];

export const columns = (
  actionSlot: (row: Row<SubmitSite>) => React.ReactNode
): ColumnDef<SubmitSite>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-6 text-center">
        <Checkbox
          aria-label="Select all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          className="translate-y-[2px]"
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-6 text-center">
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          className="translate-y-[2px]"
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CreatedAt" />
    ),
    cell: ({ row }) => (
      <div className="w-[140px] text-center">
        {format(row.getValue("createdAt"), "yyyy-MM-dd HH:mm:ss")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    enableSorting: false,
    cell: ({ getValue }) => {
      const email = getValue<string>();

      return <div>{email}</div>;
    },
  },
  {
    id: "siteTitle",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SiteMeta" />
    ),
    cell: ({ row }) => {
      const { siteUrl, siteTitle } = row.original;
      return (
        <div className="flex items-center gap-2">
          <a href={siteUrl} rel="noreferrer" target="_blank">
            {siteTitle}
          </a>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(siteUrl);
            }}
            size="sm"
            variant="outline"
          >
            <span className="i-lucide-copy text-sm" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    enableSorting: false,
    cell: ({ row }) => actionSlot(row),
  },
];
