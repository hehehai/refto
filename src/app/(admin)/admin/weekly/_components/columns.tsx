"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import type { Weekly } from "@/lib/db/schema";

export const columns = (
  actionSlot: (row: Row<Weekly>) => React.ReactNode
): ColumnDef<Weekly>[] => [
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
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    enableSorting: false,
    cell: ({ row }) => actionSlot(row),
  },
];
