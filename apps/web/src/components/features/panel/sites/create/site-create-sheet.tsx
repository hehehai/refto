import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
import { SiteDetailView } from "../common/site-detail-view";
import { SiteForm, type SiteFormValues } from "../common/site-form";
import { PageDialog } from "../page/page-dialog";
import { type Page, PageTabs } from "../page/page-tabs";
import { VersionDialog } from "../version/version-dialog";
import { VersionForm } from "../version/version-form";
import { type Version, VersionTabs } from "../version/version-tabs";

interface LocalVersion extends Version {
  siteOG: string | null;
  webCover: string;
  webRecord: string | null;
  mobileCover: string | null;
  mobileRecord: string | null;
}

interface LocalPage extends Page {
  versions: LocalVersion[];
}

interface SiteCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteCreateSheet({ open, onOpenChange }: SiteCreateSheetProps) {
  const queryClient = useQueryClient();

  // Site state
  const [createdSite, setCreatedSite] = useState<{
    id: string;
    title: string;
    description: string;
    logo: string;
    url: string;
    tags: string[];
    rating: number;
    isPinned: boolean;
  } | null>(null);

  // Pages & versions state (local until save)
  const [pages, setPages] = useState<LocalPage[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

  // Dialog states
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [pageDialogMode, setPageDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [editingPage, setEditingPage] = useState<LocalPage | null>(null);

  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versionDialogMode, setVersionDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [editingVersion, setEditingVersion] = useState<LocalVersion | null>(
    null
  );

  const activePage = pages.find((p) => p.id === activePageId);
  const activeVersion = activePage?.versions.find(
    (v) => v.id === activeVersionId
  );

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
      await createSiteMutation.mutateAsync(value as SiteFormValues);
    },
  });

  // Create site mutation
  const createSiteMutation = useMutation({
    ...orpc.panel.site.upsert.mutationOptions(),
    onSuccess: (site) => {
      setCreatedSite({
        id: site.id,
        title: site.title,
        description: site.description,
        logo: site.logo,
        url: site.url,
        tags: site.tags,
        rating: site.rating,
        isPinned: site.isPinned,
      });
      toast.success("Site created successfully");
    },
  });

  // Save pages & versions mutation
  const savePagesVersionsMutation = useMutation({
    mutationFn: async () => {
      if (!createdSite) throw new Error("Site not created");

      // Create pages and versions sequentially
      for (const page of pages) {
        const createdPage = await orpc.panel.page.upsert.call({
          siteId: createdSite.id,
          title: page.title,
          url: page.url,
          isDefault: page.isDefault,
        });

        // Create versions for this page
        for (const version of page.versions) {
          await orpc.panel.version.upsert.call({
            pageId: createdPage.id,
            versionDate: version.versionDate,
            versionNote: version.versionNote ?? undefined,
            siteOG: version.siteOG ?? undefined,
            webCover: version.webCover,
            webRecord: version.webRecord ?? undefined,
            mobileCover: version.mobileCover ?? undefined,
            mobileRecord: version.mobileRecord ?? undefined,
          });
        }
      }
    },
    onSuccess: () => {
      // Invalidate site list to show updated counts
      queryClient.invalidateQueries({
        queryKey: orpc.panel.site.list.key(),
      });
      toast.success("Pages and versions saved successfully");
      handleClose();
    },
  });

  // Reset state when sheet opens/closes
  useEffect(() => {
    if (open) {
      form.reset();
      setCreatedSite(null);
      setPages([]);
      setActivePageId(null);
      setActiveVersionId(null);
    }
  }, [open, form]);

  const handleClose = () => {
    onOpenChange(false);
  };

  // Page handlers
  const handleAddPage = () => {
    setPageDialogMode("create");
    setEditingPage(null);
    setPageDialogOpen(true);
  };

  const handleEditPage = (page: Page) => {
    const localPage = pages.find((p) => p.id === page.id);
    if (localPage) {
      setPageDialogMode("edit");
      setEditingPage(localPage);
      setPageDialogOpen(true);
    }
  };

  const handleDeletePage = (page: Page) => {
    setPages((prev) => prev.filter((p) => p.id !== page.id));
    if (activePageId === page.id) {
      const remaining = pages.filter((p) => p.id !== page.id);
      setActivePageId(remaining[0]?.id ?? null);
      setActiveVersionId(null);
    }
  };

  const handlePageSubmit = async (data: {
    title: string;
    url: string;
    isDefault: boolean;
  }) => {
    if (pageDialogMode === "create") {
      const newPage: LocalPage = {
        id: `temp-${Date.now()}`,
        title: data.title,
        url: data.url,
        isDefault: data.isDefault,
        versions: [],
      };

      // If setting as default, unset others
      if (data.isDefault) {
        setPages((prev) =>
          prev.map((p) => ({ ...p, isDefault: false })).concat(newPage)
        );
      } else {
        // If this is the first page, make it default
        const shouldBeDefault = pages.length === 0;
        setPages((prev) => [
          ...prev,
          { ...newPage, isDefault: shouldBeDefault },
        ]);
      }

      setActivePageId(newPage.id);
      setActiveVersionId(null);
    } else if (editingPage) {
      setPages((prev) =>
        prev.map((p) => {
          if (p.id === editingPage.id) {
            return { ...p, ...data };
          }
          // If setting as default, unset others
          if (data.isDefault && p.id !== editingPage.id) {
            return { ...p, isDefault: false };
          }
          return p;
        })
      );
    }
  };

  // Version handlers
  const handleAddVersion = () => {
    setVersionDialogMode("create");
    setEditingVersion(null);
    setVersionDialogOpen(true);
  };

  const handleEditVersion = (version: Version) => {
    const localVersion = activePage?.versions.find((v) => v.id === version.id);
    if (localVersion) {
      setVersionDialogMode("edit");
      setEditingVersion(localVersion);
      setVersionDialogOpen(true);
    }
  };

  const handleDeleteVersion = (version: Version) => {
    if (!activePageId) return;
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === activePageId) {
          return {
            ...p,
            versions: p.versions.filter((v) => v.id !== version.id),
          };
        }
        return p;
      })
    );
    if (activeVersionId === version.id) {
      const remaining = activePage?.versions.filter((v) => v.id !== version.id);
      setActiveVersionId(remaining?.[0]?.id ?? null);
    }
  };

  const handleVersionSubmit = async (data: {
    versionDate: Date;
    versionNote?: string;
  }) => {
    if (!activePageId) return;

    if (versionDialogMode === "create") {
      const newVersion: LocalVersion = {
        id: `temp-${Date.now()}`,
        versionDate: data.versionDate,
        versionNote: data.versionNote,
        siteOG: null,
        webCover: "",
        webRecord: null,
        mobileCover: null,
        mobileRecord: null,
      };

      setPages((prev) =>
        prev.map((p) => {
          if (p.id === activePageId) {
            return { ...p, versions: [...p.versions, newVersion] };
          }
          return p;
        })
      );

      setActiveVersionId(newVersion.id);
    } else if (editingVersion) {
      setPages((prev) =>
        prev.map((p) => {
          if (p.id === activePageId) {
            return {
              ...p,
              versions: p.versions.map((v) =>
                v.id === editingVersion.id ? { ...v, ...data } : v
              ),
            };
          }
          return p;
        })
      );
    }
  };

  // Version form data change
  const handleVersionFormChange = (data: Partial<LocalVersion>) => {
    if (!(activePageId && activeVersionId)) return;

    setPages((prev) =>
      prev.map((p) => {
        if (p.id === activePageId) {
          return {
            ...p,
            versions: p.versions.map((v) =>
              v.id === activeVersionId ? { ...v, ...data } : v
            ),
          };
        }
        return p;
      })
    );
  };

  const isSiteCreated = !!createdSite;
  const canSaveAll =
    pages.length > 0 &&
    pages.every(
      (p) => p.versions.length > 0 && p.versions.every((v) => v.webCover)
    );

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className="h-full border-none bg-transparent p-3 shadow-none data-[side=right]:max-w-3/4 data-[side=right]:sm:max-w-3/4"
        showCloseButton={false}
        side="right"
      >
        <div className="flex h-full w-full flex-col gap-4 rounded-xl bg-background shadow-lg">
          <SheetHeader className="sr-only">
            <SheetTitle>Create Site</SheetTitle>
            <SheetDescription>Create a new site</SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left side - Site form/detail */}
            <div className="h-full w-100 shrink-0 border-r">
              <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
                {isSiteCreated ? (
                  <SiteDetailView site={createdSite} />
                ) : (
                  <form
                    id="site-create-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      form.handleSubmit();
                    }}
                  >
                    <SiteForm
                      disabled={createSiteMutation.isPending}
                      form={form}
                    />
                  </form>
                )}
              </div>

              <div className="mt-auto flex h-14 items-center justify-between gap-2 border-border border-t px-3">
                <SheetClose
                  className={cn(
                    "border-border!",
                    buttonVariants({ variant: "outline" })
                  )}
                >
                  Close
                </SheetClose>
                <div className="flex items-center gap-2">
                  {/* Create Site button */}
                  {!isSiteCreated && (
                    <Button
                      disabled={createSiteMutation.isPending}
                      form="site-create-form"
                      type="submit"
                    >
                      {createSiteMutation.isPending
                        ? "Creating..."
                        : "Create Site"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Pages & Versions */}
            <div
              className={cn(
                "flex flex-1 flex-col overflow-hidden",
                !isSiteCreated && "pointer-events-none opacity-50"
              )}
            >
              {/* Page tabs */}
              <PageTabs
                activePageId={activePageId}
                disabled={!isSiteCreated}
                onAddPage={handleAddPage}
                onDeletePage={handleDeletePage}
                onEditPage={handleEditPage}
                onPageSelect={setActivePageId}
                pages={pages}
              />

              {/* Content area */}
              <div className="flex flex-1 overflow-hidden">
                {activePage ? (
                  <>
                    {/* Version tabs (vertical) */}
                    <VersionTabs
                      activeVersionId={activeVersionId}
                      disabled={!isSiteCreated}
                      onAddVersion={handleAddVersion}
                      onDeleteVersion={handleDeleteVersion}
                      onEditVersion={handleEditVersion}
                      onVersionSelect={setActiveVersionId}
                      versions={activePage.versions}
                    />

                    {/* Version form */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {activeVersion ? (
                        <VersionForm
                          disabled={!isSiteCreated}
                          onChange={handleVersionFormChange}
                          value={activeVersion}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <span className="i-hugeicons-folder-add mb-2 block size-12 opacity-50" />
                            <p>Add a version to get started</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="i-hugeicons-file-add mb-2 block size-12 opacity-50" />
                      <p>Add a page to get started</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Save All button */}
              {isSiteCreated && (
                <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
                  <Button
                    disabled={
                      !canSaveAll || savePagesVersionsMutation.isPending
                    }
                    onClick={() => savePagesVersionsMutation.mutate()}
                  >
                    {savePagesVersionsMutation.isPending
                      ? "Saving..."
                      : "Save All"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>

      {/* Page Dialog */}
      <PageDialog
        mode={pageDialogMode}
        onOpenChange={setPageDialogOpen}
        onSubmit={handlePageSubmit}
        open={pageDialogOpen}
        page={editingPage ?? undefined}
      />

      {/* Version Dialog */}
      <VersionDialog
        mode={versionDialogMode}
        onOpenChange={setVersionDialogOpen}
        onSubmit={handleVersionSubmit}
        open={versionDialogOpen}
        version={editingVersion ?? undefined}
      />
    </Sheet>
  );
}
