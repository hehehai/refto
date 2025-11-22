"use client";

import type { Subscriber } from "@prisma/client";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";

import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export const columns = (
  actionSlot: (row: Row<Subscriber>) => React.ReactNode
): ColumnDef<Subscriber>[] => [
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
          className="translate-y-0.5"
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-6 text-center">
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          className="translate-y-0.5"
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
      <div className="w-[150px] text-left">
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
    cell: ({ getValue, row }) => {
      const email = getValue<string>();

      return (
        <div className="flex items-center space-x-1">
          {row.original.locale && (
            <Badge variant="secondary">{row.original.locale}</Badge>
          )}
          <span>{email}</span>
        </div>
      );
    },
  },
  {
    id: "weekly",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SentWeekly" />
    ),
    cell: ({ getValue }) => {
      const weekly = getValue<string[]>();
      return <div>{weekly?.length}</div>;
    },
  },
  {
    accessorKey: "unSubDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="UnSub Date" />
    ),
    cell: ({ getValue }) => {
      const unSubDate = getValue<number>();

      if (!unSubDate) {
        return <Badge>Active</Badge>;
      }

      return (
        <Badge variant={"outline"}>{format(unSubDate, "yyyy-MM-dd")}</Badge>
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
