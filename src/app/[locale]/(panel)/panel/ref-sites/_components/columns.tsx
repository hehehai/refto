"use client";

import { type ColumnDef, type Row } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { format } from "date-fns";
import { type RefSite } from "@prisma/client";
import { LikeIcon, VisitIcon } from "@/components/shared/icons";
import { BlurImage } from "@/components/shared/blur-image";

interface ColumnsMethods {
  onDetail: (rowId: string) => void;
}

export const columns = (
  actionSlot: (row: Row<RefSite>) => React.ReactNode,
  methods?: ColumnsMethods,
): ColumnDef<RefSite>[] => [
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
    accessorKey: "siteName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    enableSorting: false,
    cell: ({ row, getValue }) => {
      const { siteUrl, siteFavicon, isTop, siteTitle } = row.original;
      const name = getValue<string>();

      return (
        <div className="flex items-center space-x-2">
          {siteFavicon && (
            <div className="overflow-hidden rounded-md">
              <BlurImage src={siteFavicon} width={34} height={34} alt={name} />
            </div>
          )}
          <div className="max-w-[500px]">
            <div className="flex items-center space-x-2">
              <div
                className="cursor-pointer truncate text-[16px] font-medium hover:underline"
                onClick={() => methods?.onDetail(row.original.id)}
              >
                {name}
              </div>
              {siteUrl && (
                <a href={siteUrl} target="_blank" rel="noreferrer">
                  <VisitIcon className="text-lg" />
                </a>
              )}
              {isTop && <Badge className="ml-auto px-1.5 py-0">TOP</Badge>}
            </div>
            <div className="truncate text-[13px] text-slate-500">
              {siteTitle}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "likes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Likes" />
    ),
    cell: ({ getValue }) => {
      const likes = getValue<number>();

      return (
        <div className="flex w-[100px] items-center space-x-2">
          <LikeIcon className="text-xl" />
          <span>{likes}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "visits",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visits" />
    ),
    cell: ({ getValue }) => {
      const visits = getValue<number>();

      return (
        <div className="flex w-[100px] items-center space-x-2">
          <VisitIcon className="text-xl" />
          <span>{visits}</span>
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
