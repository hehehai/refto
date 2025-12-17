import { useForm } from "@tanstack/react-form";
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { orpc } from "@/lib/orpc";
import {
  addQueryData,
  deleteQueryData,
  mergeQueryData,
  updateQueryData,
  updateQueryDataWithSort,
} from "@/lib/query-helpers";
import type { SiteFormValues } from "../common/site-form";
import type { Page } from "../page/page-tabs";
import type { Version as BaseVersion } from "../version/version-tabs";
import { PageEditPanel } from "./page-edit-panel";
import { SiteEditHeader } from "./site-edit-header";
import { SiteEditSkeleton } from "./site-edit-skeleton";
import { VersionEditPanel } from "./version-edit-panel";

interface Version extends BaseVersion {
  siteOG: string | null;
  webCover: string;
  webRecord: string | null;
  mobileCover: string | null;
  mobileRecord: string | null;
}

interface SiteEditDrawerProps {
  siteId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Sort helper for versions (descending by date)
const sortVersionsByDate = (
  a: { versionDate: Date | string },
  b: { versionDate: Date | string }
) => new Date(b.versionDate).getTime() - new Date(a.versionDate).getTime();

export function SiteEditDrawer({
  siteId,
  open,
  onOpenChange,
}: SiteEditDrawerProps) {
  const queryClient = useQueryClient();

  // Edit mode for site
  const [isEditingSite, setIsEditingSite] = useState(false);

  // Active selections
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

  // Page dialog states
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [pageDialogMode, setPageDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deletePageOpen, setDeletePageOpen] = useState(false);
  const [deletingPage, setDeletingPage] = useState<Page | null>(null);

  // Version dialog states
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versionDialogMode, setVersionDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [deleteVersionOpen, setDeleteVersionOpen] = useState(false);
  const [deletingVersion, setDeletingVersion] = useState<BaseVersion | null>(
    null
  );

  // Query keys
  const siteQueryKey = orpc.panel.site.getById.queryOptions({
    input: { id: siteId! },
  }).queryKey;
  const pagesQueryKey = orpc.panel.page.list.queryOptions({
    input: { siteId: siteId! },
  }).queryKey;
  const versionsQueryKey = (pageId: string) =>
    orpc.panel.version.list.queryOptions({ input: { pageId } }).queryKey;

  // Queries
  const { data: site, isLoading: siteLoading } = useQuery(
    orpc.panel.site.getById.queryOptions({
      input: siteId && open ? { id: siteId } : skipToken,
    })
  );

  const { data: pages = [], isLoading: pagesLoading } = useQuery(
    orpc.panel.page.list.queryOptions({
      input: siteId && open ? { siteId } : skipToken,
    })
  );

  const { data: versions = [], isLoading: versionsLoading } = useQuery(
    orpc.panel.version.list.queryOptions({
      input: activePageId ? { pageId: activePageId } : skipToken,
    })
  );

  const isLoading = siteLoading || pagesLoading;
  const activePage = pages.find((p) => p.id === activePageId);

  // Site form
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      logo: "",
      url: "",
      tags: [] as string[],
      rating: 0,
      isPinned: false,
    },
    onSubmit: async ({ value }) => {
      await updateSiteMutation.mutateAsync({
        id: siteId!,
        ...value,
      } as SiteFormValues & { id: string });
    },
  });

  // Mutations
  const updateSiteMutation = useMutation({
    ...orpc.panel.site.update.mutationOptions(),
    onSuccess: (updatedSite) => {
      mergeQueryData(queryClient, siteQueryKey, updatedSite);
      toast.success("Site updated successfully");
      setIsEditingSite(false);
    },
  });

  const createPageMutation = useMutation({
    ...orpc.panel.page.create.mutationOptions(),
    onSuccess: (newPage) => {
      addQueryData(queryClient, pagesQueryKey, newPage);
      toast.success("Page created successfully");
      setActivePageId(newPage.id);
      setActiveVersionId(null);
    },
  });

  const updatePageMutation = useMutation({
    ...orpc.panel.page.update.mutationOptions(),
    onSuccess: (updatedPage) => {
      updateQueryData(queryClient, pagesQueryKey, updatedPage);
      toast.success("Page updated successfully");
    },
  });

  const deletePageMutation = useMutation({
    ...orpc.panel.page.delete.mutationOptions(),
    onSuccess: (_, deletedInput) => {
      const deletedId = deletedInput.id;
      deleteQueryData(queryClient, pagesQueryKey, deletedId);
      queryClient.removeQueries({ queryKey: versionsQueryKey(deletedId) });
      toast.success("Page deleted successfully");
      setDeletePageOpen(false);
      setDeletingPage(null);
      if (activePageId === deletedId) {
        setActivePageId(null);
        setActiveVersionId(null);
      }
    },
  });

  const createVersionMutation = useMutation({
    ...orpc.panel.version.create.mutationOptions(),
    onSuccess: (newVersion) => {
      addQueryData(queryClient, versionsQueryKey(activePageId!), newVersion, {
        prepend: true,
      });
      toast.success("Version created successfully");
      setActiveVersionId(newVersion.id);
    },
  });

  const updateVersionMutation = useMutation({
    ...orpc.panel.version.update.mutationOptions(),
    onSuccess: (updatedVersion) => {
      if (!activePageId) return;
      updateQueryDataWithSort(
        queryClient,
        versionsQueryKey(activePageId),
        updatedVersion,
        sortVersionsByDate
      );
    },
  });

  const deleteVersionMutation = useMutation({
    ...orpc.panel.version.delete.mutationOptions(),
    onSuccess: (_, deletedInput) => {
      const deletedId = deletedInput.id;
      deleteQueryData(queryClient, versionsQueryKey(activePageId!), deletedId);
      toast.success("Version deleted successfully");
      setDeleteVersionOpen(false);
      if (activeVersionId === deletedId) {
        setActiveVersionId(null);
      }
      setDeletingVersion(null);
    },
  });

  // Effects
  useEffect(() => {
    if (open && site) {
      form.reset();
      form.setFieldValue("title", site.title);
      form.setFieldValue("description", site.description ?? "");
      form.setFieldValue("logo", site.logo ?? "");
      form.setFieldValue("url", site.url);
      form.setFieldValue("tags", site.tags ?? []);
      form.setFieldValue("rating", site.rating ?? 0);
      form.setFieldValue("isPinned", site.isPinned);
      setIsEditingSite(false);
    }
  }, [open, site, form]);

  useEffect(() => {
    if (open && pages.length > 0 && !activePageId) {
      setActivePageId(pages[0].id);
    }
  }, [open, pages, activePageId]);

  useEffect(() => {
    if (versions.length > 0 && !activeVersionId) {
      setActiveVersionId(versions[0].id);
    }
  }, [versions, activeVersionId]);

  useEffect(() => {
    if (!open) {
      setActivePageId(null);
      setActiveVersionId(null);
      setIsEditingSite(false);
    }
  }, [open]);

  // Site handlers
  const handleStartEditSite = () => {
    if (site) {
      form.setFieldValue("title", site.title);
      form.setFieldValue("description", site.description ?? "");
      form.setFieldValue("logo", site.logo ?? "");
      form.setFieldValue("url", site.url);
      form.setFieldValue("tags", site.tags ?? []);
      form.setFieldValue("rating", site.rating ?? 0);
      form.setFieldValue("isPinned", site.isPinned);
    }
    setIsEditingSite(true);
  };

  const handleCancelEditSite = () => {
    setIsEditingSite(false);
    if (site) {
      form.reset();
    }
  };

  // Page handlers
  const handleAddPage = () => {
    setPageDialogMode("create");
    setEditingPage(null);
    setPageDialogOpen(true);
  };

  const handleEditPage = (page: Page) => {
    const fullPage = pages.find((p) => p.id === page.id);
    if (fullPage) {
      setPageDialogMode("edit");
      setEditingPage(fullPage);
      setPageDialogOpen(true);
    }
  };

  const handleDeletePage = (page: Page) => {
    setDeletingPage(page);
    setDeletePageOpen(true);
  };

  const handlePageSubmit = async (data: {
    title: string;
    url: string;
    isDefault: boolean;
  }) => {
    if (pageDialogMode === "create") {
      await createPageMutation.mutateAsync({ siteId: siteId!, ...data });
    } else if (editingPage) {
      await updatePageMutation.mutateAsync({ id: editingPage.id, ...data });
    }
  };

  // Version handlers
  const handleAddVersion = () => {
    setVersionDialogMode("create");
    setEditingVersion(null);
    setVersionDialogOpen(true);
  };

  const handleEditVersion = (version: BaseVersion) => {
    const fullVersion = versions.find((v) => v.id === version.id);
    if (fullVersion) {
      setVersionDialogMode("edit");
      setEditingVersion(fullVersion as Version);
      setVersionDialogOpen(true);
    }
  };

  const handleDeleteVersion = (version: BaseVersion) => {
    setDeletingVersion(version);
    setDeleteVersionOpen(true);
  };

  const handleVersionSubmit = async (data: {
    versionDate: Date;
    versionNote?: string;
  }) => {
    if (!activePageId) return;

    if (versionDialogMode === "create") {
      await createVersionMutation.mutateAsync({
        pageId: activePageId,
        versionDate: data.versionDate,
        versionNote: data.versionNote,
      });
    } else if (editingVersion) {
      await updateVersionMutation.mutateAsync({
        id: editingVersion.id,
        versionDate: data.versionDate,
        versionNote: data.versionNote,
      });
    }
  };

  const handleVersionFormChange = (data: Partial<Version>) => {
    if (!activeVersionId) return;
    updateVersionMutation.mutate({
      id: activeVersionId,
      ...data,
      versionNote: data.versionNote ?? undefined,
    });
  };

  // Map versions for display with proper date objects
  const displayVersions: Version[] = versions.map((v) => ({
    ...v,
    versionDate: new Date(v.versionDate),
  }));

  return (
    <Drawer direction="right" onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="data-[vaul-drawer-direction=right]:w-5xl data-[vaul-drawer-direction=right]:sm:max-w-5xl">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Edit Site</DrawerTitle>
          <DrawerDescription>Edit site details and pages</DrawerDescription>
        </DrawerHeader>

        {isLoading ? (
          <SiteEditSkeleton />
        ) : site ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Left side - Site detail/form */}
            <SiteEditHeader
              form={form}
              isEditing={isEditingSite}
              isSaving={updateSiteMutation.isPending}
              onCancelEdit={handleCancelEditSite}
              onStartEdit={handleStartEditSite}
              site={site}
            />

            {/* Right side - Pages & Versions */}
            <PageEditPanel
              activePageId={activePageId}
              deleteOpen={deletePageOpen}
              deletingPage={deletingPage}
              dialogMode={pageDialogMode}
              dialogOpen={pageDialogOpen}
              editingPage={editingPage}
              isDeleting={deletePageMutation.isPending}
              isSubmitting={
                createPageMutation.isPending || updatePageMutation.isPending
              }
              onAddPage={handleAddPage}
              onConfirmDelete={() =>
                deletingPage &&
                deletePageMutation.mutate({ id: deletingPage.id })
              }
              onDeleteOpenChange={setDeletePageOpen}
              onDeletePage={handleDeletePage}
              onDialogOpenChange={setPageDialogOpen}
              onEditPage={handleEditPage}
              onPageSelect={(id) => {
                setActivePageId(id);
                setActiveVersionId(null);
              }}
              onPageSubmit={handlePageSubmit}
              pages={pages}
            >
              {activePage ? (
                <VersionEditPanel
                  activeVersionId={activeVersionId}
                  deleteOpen={deleteVersionOpen}
                  deletingVersion={deletingVersion}
                  dialogMode={versionDialogMode}
                  dialogOpen={versionDialogOpen}
                  editingVersion={editingVersion}
                  isDeleting={deleteVersionMutation.isPending}
                  isLoading={versionsLoading}
                  isSubmitting={
                    createVersionMutation.isPending ||
                    updateVersionMutation.isPending
                  }
                  onAddVersion={handleAddVersion}
                  onConfirmDelete={() =>
                    deletingVersion &&
                    deleteVersionMutation.mutate({ id: deletingVersion.id })
                  }
                  onDeleteOpenChange={setDeleteVersionOpen}
                  onDeleteVersion={handleDeleteVersion}
                  onDialogOpenChange={setVersionDialogOpen}
                  onEditVersion={handleEditVersion}
                  onVersionFormChange={handleVersionFormChange}
                  onVersionSelect={setActiveVersionId}
                  onVersionSubmit={handleVersionSubmit}
                  versions={displayVersions}
                />
              ) : (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <span className="i-hugeicons-file-add mb-2 block size-12 opacity-50" />
                    <p>Add a page to get started</p>
                  </div>
                </div>
              )}
            </PageEditPanel>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Site not found
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
