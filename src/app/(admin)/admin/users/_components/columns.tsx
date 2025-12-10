"use client";

import {
  CheckCircledIcon,
  CrossCircledIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { Shield, ShieldAlert } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export type UserWithMeta = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  submissionCount: number;
};

export const roles = [
  {
    value: "USER" as const,
    label: "User",
    icon: PersonIcon,
  },
  {
    value: "ADMIN" as const,
    label: "Admin",
    icon: Shield,
  },
];

export const statuses = [
  {
    value: "active" as const,
    label: "Active",
    icon: CheckCircledIcon,
  },
  {
    value: "banned" as const,
    label: "Banned",
    icon: CrossCircledIcon,
  },
];

export const columns = (
  actionSlot: (row: Row<UserWithMeta>) => React.ReactNode
): ColumnDef<UserWithMeta>[] => [
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
    id: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const { name, email, image, banned } = row.original;

      return (
        <div className="flex items-center gap-3">
          <UserAvatar className="h-8 w-8" user={{ name, image }} />
          <div className="flex flex-col">
            <span className="font-medium">
              {name || "No name"}
              {banned && (
                <ShieldAlert className="ml-1 inline h-4 w-4 text-destructive" />
              )}
            </span>
            <span className="text-muted-foreground text-xs">{email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleConfig = roles.find((r) => r.value === role);

      return (
        <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
          {roleConfig?.icon && <roleConfig.icon className="mr-1 h-3 w-3" />}
          {roleConfig?.label ?? role}
        </Badge>
      );
    },
  },
  {
    id: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const banned = row.original.banned;
      const status = statuses.find(
        (s) => s.value === (banned ? "banned" : "active")
      );

      return (
        <Badge variant={banned ? "destructive" : "outline"}>
          {status?.icon && <status.icon className="mr-1 h-3 w-3" />}
          {status?.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "submissionCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submissions" />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const count = row.getValue("submissionCount") as number;
      return <div className="text-center">{count}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registered" />
    ),
    cell: ({ row }) => (
      <div className="w-[100px]">
        {format(row.getValue("createdAt"), "yyyy-MM-dd")}
      </div>
    ),
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
