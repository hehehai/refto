import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
import { z } from "zod";
import { NavMainHeader } from "@/components/features/panel/layout/nav-main-header";
import { SiteDataTable } from "@/components/features/panel/sites/data-table";
import { SiteFormDrawer } from "@/components/features/panel/sites/site-form-drawer";
import { useSiteActions } from "@/components/features/panel/sites/use-site-actions";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { StatusFilterSelect } from "@/components/shared/data-table/status-filter";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";

const PIN_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pinned", label: "Pinned" },
  { value: "unpinned", label: "Not Pinned" },
] as const;

const searchSchema = z.object({
  search: z.string().catch(""),
  isPinned: z.enum(["all", "pinned", "unpinned"]).catch("all"),
  sortBy: z.enum(["createdAt", "visits"]).catch("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).catch("desc"),
});

type SearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/(admin)/panel/sites")({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const actions = useSiteActions();

  // Create drawer state
  const [createOpen, setCreateOpen] = useState(false);

  // Update search params
  const updateSearch = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev: SearchParams) => ({ ...prev, ...updates }),
    });
  };

  // Convert isPinned filter to boolean
  const isPinnedValue =
    search.isPinned === "pinned"
      ? true
      : search.isPinned === "unpinned"
        ? false
        : undefined;

  // Query
  const { data, isLoading } = useQuery(
    orpc.panel.site.list.queryOptions({
      input: {
        search: search.search || undefined,
        isPinned: isPinnedValue,
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
      },
    })
  );

  // Handlers
  const handleSearchChange = (value: string) => {
    updateSearch({ search: value });
  };

  const handlePinStatusChange = (
    value: "all" | "pinned" | "unpinned" | null
  ) => {
    updateSearch({ isPinned: value ?? "all" });
  };

  const handleSortChange = (
    sortBy: "createdAt" | "visits",
    order: "asc" | "desc"
  ) => {
    updateSearch({ sortBy, sortOrder: order });
  };

  const handleCreate = async (formData: {
    title: string;
    description: string;
    logo: string;
    url: string;
    tags: string[];
    rating: number;
    isPinned: boolean;
  }) => {
    await actions.create.mutateAsync(formData);
  };

  return (
    <div className="w-full">
      <NavMainHeader
        className="justify-between"
        left={
          <div className="flex flex-1 items-center gap-3">
            <h2 className="font-semibold">Sites</h2>
            <DataTableToolbar
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search by title or URL..."
              searchValue={search.search}
            >
              <StatusFilterSelect
                items={[...PIN_STATUS_OPTIONS]}
                onChange={handlePinStatusChange}
                value={search.isPinned}
              />
            </DataTableToolbar>
          </div>
        }
        right={
          <Button onClick={() => setCreateOpen(true)}>
            <span className="i-hugeicons-plus-sign size-3.5" />
            Create Site
          </Button>
        }
      />

      {/* Data Table */}
      <div className="p-4">
        <SiteDataTable
          data={data?.items ?? []}
          isLoading={isLoading}
          onSortChange={handleSortChange}
          sortBy={search.sortBy}
          sortOrder={search.sortOrder}
        />
      </div>

      {/* Create Drawer */}
      <SiteFormDrawer
        mode="create"
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        open={createOpen}
      />
    </div>
  );
}
