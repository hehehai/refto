"use client";

import { type ColumnDef, type Row } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { format } from "date-fns";
import { type Weekly } from "@prisma/client";

export const columns = (
  actionSlot: (row: Row<Weekly>) => React.ReactNode,
): ColumnDef<Weekly>[] => [
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
    accessorKey: "weekStart",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Week Date" />
    ),
    cell: ({ row }) => {
      const weekStart = row.original?.weekStart;
      const weekEnd = row.original?.weekEnd;
      return (
        <div className="w-[200px] text-left">
          {weekStart ? format(weekStart, "yyyy-MM-dd") : "unknown"}
          {" ~ "}
          {weekEnd ? format(weekEnd, "yyyy-MM-dd") : "unknown"}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    enableSorting: false,
    cell: ({ getValue }) => {
      const title = getValue<string>();

      return <div className="flex items-center space-x-1">{title}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => {
      const status = getValue<number>();

      return <Badge variant={"outline"}>{status}</Badge>;
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
