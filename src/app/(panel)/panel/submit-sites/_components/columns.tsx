"use client";

import { type ColumnDef, type Row } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { format } from "date-fns";
import { type SubmitSite, SubmitSiteStatus } from "@prisma/client";
import { ClockIcon } from "lucide-react";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

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
  actionSlot: (row: Row<SubmitSite>) => React.ReactNode,
): ColumnDef<SubmitSite>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-6 text-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-6 text-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
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
          <a href={siteUrl} target="_blank" rel="noreferrer">
            {siteTitle}
          </a>
          <Button
            variant="outline"
            size="mini"
            onClick={() => {
              navigator.clipboard.writeText(siteUrl);
            }}
          >
            <span className="i-lucide-copy text-sm"></span>
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
        (status) => status.value === row.getValue("status"),
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
