import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { NavMainHeader } from "@/components/features/panel/layout/nav-main-header";
import {
  SubmitSiteDataTable,
  type SubmitSiteStatus,
} from "@/components/features/panel/submit-sites/data-table";
import {
  DataTableToolbar,
  UserFilterSelect,
} from "@/components/shared/data-table";
import { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected"] as const;

const searchSchema = z.object({
  search: z.string().catch(""),
  status: z.enum(["ALL", "PENDING", "APPROVED", "REJECTED"]).catch("PENDING"),
  userId: z.string().optional().catch(undefined),
  sortBy: z.enum(["createdAt", "updatedAt"]).catch("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).catch("desc"),
  page: z.number().int().positive().catch(1),
});

type SearchParams = z.infer<typeof searchSchema>;

const submitSitesMeta = createPageMeta({
  title: "Manage Submissions",
  description: "Review and manage site submissions on Refto.",
  url: "/panel/submit-sites",
  noIndex: true,
});

export const Route = createFileRoute("/(admin)/panel/submit-sites")({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: submitSitesMeta.meta,
    links: submitSitesMeta.links,
  }),
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
        page: search.page,
      },
    })
  );

  // Handlers
  const handleSearchChange = (value: string) => {
    updateSearch({ search: value, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    updateSearch({
      status: value.toUpperCase() as SearchParams["status"],
      page: 1,
    });
  };

  const handleUserChange = (value: string | null) => {
    updateSearch({ userId: value ?? undefined, page: 1 });
  };

  const handleSortChange = (
    sortBy: "createdAt" | "updatedAt",
    order: "asc" | "desc"
  ) => {
    updateSearch({ sortBy, sortOrder: order, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateSearch({ page });
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
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          pagination={
            data
              ? {
                  total: data.total,
                  totalPages: data.totalPages,
                  page: data.page,
                  pageSize: data.pageSize,
                }
              : undefined
          }
          sortBy={search.sortBy}
          sortOrder={search.sortOrder}
          status={search.status as SubmitSiteStatus}
        />
      </div>
    </div>
  );
}
