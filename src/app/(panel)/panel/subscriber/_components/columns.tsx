"use client";

import { type ColumnDef, type Row } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { format } from "date-fns";
import { type Subscriber } from "@prisma/client";
import Image from "next/image";
import { LikeIcon, VisitIcon } from "@/components/shared/icons";

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
      <div className="w-[80px] text-center">
        {format(row.getValue("createdAt"), "yyyy-MM-dd")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    enableSorting: false,
    cell: ({ row, getValue }) => {
      const email = getValue<string>();

      return <div>{email}</div>;
    },
  },
  {
    id: "_count.sentWeekly",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SentWeekly" />
    ),
    cell: ({ row }) => {
      return <div>{(row.original as any)?._count.sentWeekly}</div>;
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
