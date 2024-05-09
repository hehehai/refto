"use client";

import { type ColumnDef, type Row } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { format } from "date-fns";
import { type Subscriber } from "@prisma/client";

export const columns = (
  actionSlot: (row: Row<Subscriber>) => React.ReactNode,
): ColumnDef<Subscriber>[] => [
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
