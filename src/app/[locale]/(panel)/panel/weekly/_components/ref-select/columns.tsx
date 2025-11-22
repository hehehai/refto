"use client";

import type { RefSite } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { BlurImage } from "@/components/shared/blur-image";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { VisitIcon } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface ColumnsMethods {
  onDetail?: (rowId: string) => void;
}

export const columns = ({
  onDetail,
}: ColumnsMethods = {}): ColumnDef<RefSite>[] => [
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
          disabled={!table.getIsSomePageRowsSelected()}
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
          disabled={!(row.getIsSelected() || row.getCanSelect())}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
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
              <BlurImage alt={name} height={34} src={siteFavicon} width={34} />
            </div>
          )}
          <div className="max-w-[500px]">
            <div className="flex items-center space-x-2">
              <div
                className="cursor-pointer truncate font-medium text-[16px] hover:underline"
                onClick={() => onDetail?.(row.original.id)}
              >
                {name}
              </div>
              {siteUrl && (
                <a href={siteUrl} rel="noreferrer" target="_blank">
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
];
