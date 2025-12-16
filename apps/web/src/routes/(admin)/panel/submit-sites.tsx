import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { NavMainHeader } from "@/components/features/panel/layout/nav-main-header";
import {
  SubmitSiteDataTable,
  type SubmitSiteStatus,
} from "@/components/features/panel/submit-sites/data-table";
import { UserDetailDrawer } from "@/components/features/panel/users/user-detail-drawer";
import {
  DataTableToolbar,
  UserFilterSelect,
} from "@/components/shared/data-table";
import { orpc } from "@/lib/orpc";

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected"] as const;

const searchSchema = z.object({
  search: z.string().catch(""),
  status: z.enum(["ALL", "PENDING", "APPROVED", "REJECTED"]).catch("PENDING"),
  userId: z.string().optional().catch(undefined),
  sortBy: z.enum(["createdAt", "updatedAt"]).catch("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).catch("desc"),
});

type SearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/(admin)/panel/submit-sites")({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  // Update search params
  const updateSearch = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev: SearchParams) => ({ ...prev, ...updates }),
    });
  };

  // Query
  const { data, isLoading } = useQuery(
    orpc.panel.submitSite.list.queryOptions({
      input: {
        search: search.search || undefined,
        status: search.status,
        userId: search.userId,
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
      },
    })
  );

  // Handlers
  const handleSearchChange = (value: string) => {
    updateSearch({ search: value });
  };

  const handleStatusChange = (value: string) => {
    updateSearch({ status: value.toUpperCase() as SearchParams["status"] });
  };

  const handleUserChange = (value: string | null) => {
    updateSearch({ userId: value ?? undefined });
  };

  const handleSortChange = (
    sortBy: "createdAt" | "updatedAt",
    order: "asc" | "desc"
  ) => {
    updateSearch({ sortBy, sortOrder: order });
  };

  return (
    <div className="w-full">
      <NavMainHeader
        activeTab={search.status}
        className="justify-between"
        left={
          <div className="flex flex-1 items-center gap-3">
            <h2 className="font-semibold">Submit Sites</h2>
            <DataTableToolbar
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search by title or url..."
              searchValue={search.search}
            >
              <UserFilterSelect
                onChange={handleUserChange}
                value={search.userId ?? null}
              />
            </DataTableToolbar>
          </div>
        }
        onTabChange={handleStatusChange}
        tabItems={[...STATUS_TABS]}
      />

      {/* Data Table */}
      <div className="p-4">
        <SubmitSiteDataTable
          data={data?.items ?? []}
          isLoading={isLoading}
          onSortChange={handleSortChange}
          sortBy={search.sortBy}
          sortOrder={search.sortOrder}
          status={search.status as SubmitSiteStatus}
        />
      </div>

      {/* User Detail Drawer (reused from users) */}
      <UserDetailDrawer />
    </div>
  );
}
