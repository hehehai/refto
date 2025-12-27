import { useForm } from "@tanstack/react-form";
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import type { SiteFormType } from "@/lib/form-types";
import { orpc } from "@/lib/orpc";
import {
  addQueryData,
  deleteQueryData,
  mergeQueryData,
  updateQueryData,
  updateQueryDataWithSort,
} from "@/lib/query-helpers";
import type { Page } from "../page/page-tabs";
import type { Version as BaseVersion } from "../version/version-tabs";

interface Version extends BaseVersion {
  siteOG: string | null;
  webCover: string;
  webRecord: string | null;
  mobileCover: string | null;
  mobileRecord: string | null;
  tagIds: string[];
}

// Sort helper for versions (descending by date)
const sortVersionsByDate = (
  a: { versionDate: Date | string },
  b: { versionDate: Date | string }
) => new Date(b.versionDate).getTime() - new Date(a.versionDate).getTime();

interface SiteEditContextType {
  // Site data
  siteId: string;
  site: {
    id: string;
    title: string;
    slug: string;
    description: string;
    logo: string;
    url: string;
    tagIds: string[];
    rating: number;
    isPinned: boolean;
  } | null;
  isLoading: boolean;

  // Site editing
  form: SiteFormType;
  isEditingSite: boolean;
  isSavingSite: boolean;
  startEditSite: () => void;
  cancelEditSite: () => void;

  // Pages
  pages: Page[];
  activePageId: string | null;
  setActivePageId: (id: string | null) => void;

  // Page dialog
  pageDialogOpen: boolean;
  pageDialogMode: "create" | "edit";
  editingPage: Page | null;
  openPageDialog: (mode: "create" | "edit", page?: Page) => void;
  closePageDialog: () => void;
  handlePageSubmit: (data: {
    title: string;
    slug: string;
    url: string;
    isDefault: boolean;
  }) => Promise<void>;
  handleDeletePage: (page: Page) => void;
  isPageSubmitting: boolean;

  // Versions
  versions: Version[];
  versionsLoading: boolean;
  activeVersionId: string | null;
  setActiveVersionId: (id: string | null) => void;

  // Version dialog
  versionDialogOpen: boolean;
  versionDialogMode: "create" | "edit";
  editingVersion: Version | null;
  openVersionDialog: (mode: "create" | "edit", version?: BaseVersion) => void;
  closeVersionDialog: () => void;
  handleVersionSubmit: (data: {
    versionDate: Date;
    versionNote?: string;
  }) => Promise<void>;
  handleDeleteVersion: (version: BaseVersion) => void;
  handleVersionFormChange: (data: Partial<Version>) => void;
  isVersionSubmitting: boolean;
}

const SiteEditContext = createContext<SiteEditContextType | null>(null);

export function useSiteEdit() {
  const ctx = useContext(SiteEditContext);
  if (!ctx) throw new Error("useSiteEdit must be used within SiteEditProvider");
  return ctx;
}

interface SiteEditProviderProps {
  siteId: string;
  initialPageId?: string;
  open: boolean;
  children: ReactNode;
}

export function SiteEditProvider({
  siteId,
  initialPageId,
  open,
  children,
}: SiteEditProviderProps) {
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

  // Version dialog states
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versionDialogMode, setVersionDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);

  // Query keys
  const siteQueryKey = orpc.panel.site.getById.queryOptions({
    input: { id: siteId },
  }).queryKey;
  const pagesQueryKey = orpc.panel.page.list.queryOptions({
    input: { siteId },
  }).queryKey;
  const versionsQueryKey = (pageId: string) =>
    orpc.panel.version.list.queryOptions({ input: { pageId } }).queryKey;

  // Queries
  const { data: site, isLoading: siteLoading } = useQuery(
    orpc.panel.site.getById.queryOptions({
      input: open ? { id: siteId } : skipToken,
    })
  );

  const { data: pages = [], isLoading: pagesLoading } = useQuery(
    orpc.panel.page.list.queryOptions({
      input: open ? { siteId } : skipToken,
    })
  );

  // Sort pages: default first
  const sortedPages = useMemo(
    () =>
      [...pages].sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      }),
    [pages]
  );

  const { data: versions = [], isLoading: versionsLoading } = useQuery(
    orpc.panel.version.list.queryOptions({
      input: activePageId ? { pageId: activePageId } : skipToken,
    })
  );

  const isLoading = siteLoading || pagesLoading;

  // Site form
  const form = useForm({
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      logo: "",
      url: "",
      tagIds: [] as string[],
      rating: 0,
      isPinned: false,
    },
    onSubmit: async ({ value }) => {
      await upsertSiteMutation.mutateAsync({
        id: siteId,
        ...value,
      });
    },
  });

  // Mutations
  const upsertSiteMutation = useMutation({
    ...orpc.panel.site.upsert.mutationOptions(),
    onSuccess: (updatedSite) => {
      mergeQueryData(queryClient, siteQueryKey, updatedSite);
      toast.success("Site updated successfully");
      setIsEditingSite(false);
    },
  });

  const upsertPageMutation = useMutation({
    ...orpc.panel.page.upsert.mutationOptions(),
    onSuccess: (result, variables) => {
      if (variables.id) {
        updateQueryData(queryClient, pagesQueryKey, result);
        toast.success("Page updated successfully");
      } else {
        addQueryData(queryClient, pagesQueryKey, result);
        toast.success("Page created successfully");
        setActivePageId(result.id);
        setActiveVersionId(null);
      }
      setPageDialogOpen(false);
    },
  });

  const deletePageMutation = useMutation({
    ...orpc.panel.page.delete.mutationOptions(),
    onSuccess: (_, deletedInput) => {
      const deletedId = deletedInput.id;
      deleteQueryData(queryClient, pagesQueryKey, deletedId);
      queryClient.removeQueries({ queryKey: versionsQueryKey(deletedId) });
      toast.success("Page deleted successfully");
      if (activePageId === deletedId) {
        setActivePageId(null);
        setActiveVersionId(null);
      }
    },
  });

  const upsertVersionMutation = useMutation({
    ...orpc.panel.version.upsert.mutationOptions(),
    onSuccess: (result, variables) => {
      if (variables.id) {
        if (!activePageId) return;
        updateQueryDataWithSort(
          queryClient,
          versionsQueryKey(activePageId),
          result,
          sortVersionsByDate
        );
      } else {
        addQueryData(queryClient, versionsQueryKey(activePageId!), result, {
          prepend: true,
        });
        toast.success("Version created successfully");
        setActiveVersionId(result.id);
      }
      setVersionDialogOpen(false);
    },
  });

  const deleteVersionMutation = useMutation({
    ...orpc.panel.version.delete.mutationOptions(),
    onSuccess: (_, deletedInput) => {
      const deletedId = deletedInput.id;
      deleteQueryData(queryClient, versionsQueryKey(activePageId!), deletedId);
      toast.success("Version deleted successfully");
      if (activeVersionId === deletedId) {
        setActiveVersionId(null);
      }
    },
  });

  // Effects
  useEffect(() => {
    if (open && site) {
      form.reset();
      form.setFieldValue("title", site.title);
      form.setFieldValue("slug", site.slug ?? "");
      form.setFieldValue("description", site.description ?? "");
      form.setFieldValue("logo", site.logo ?? "");
      form.setFieldValue("url", site.url);
      form.setFieldValue("tagIds", site.tagIds ?? []);
      form.setFieldValue("rating", site.rating ?? 0);
      form.setFieldValue("isPinned", site.isPinned);
      setIsEditingSite(false);
    }
  }, [open, site, form]);

  useEffect(() => {
    if (open && sortedPages.length > 0 && !activePageId) {
      // Use initialPageId if provided and valid, otherwise use first page
      const targetPageId =
        initialPageId && sortedPages.some((p: Page) => p.id === initialPageId)
          ? initialPageId
          : sortedPages[0].id;
      setActivePageId(targetPageId);
    }
  }, [open, sortedPages, activePageId, initialPageId]);

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
  const startEditSite = () => {
    if (site) {
      form.setFieldValue("title", site.title);
      form.setFieldValue("slug", site.slug ?? "");
      form.setFieldValue("description", site.description ?? "");
      form.setFieldValue("logo", site.logo ?? "");
      form.setFieldValue("url", site.url);
      form.setFieldValue("tagIds", site.tagIds ?? []);
      form.setFieldValue("rating", site.rating ?? 0);
      form.setFieldValue("isPinned", site.isPinned);
    }
    setIsEditingSite(true);
  };

  const cancelEditSite = () => {
    setIsEditingSite(false);
    if (site) {
      form.reset();
    }
  };

  // Page handlers
  const openPageDialog = (mode: "create" | "edit", page?: Page) => {
    setPageDialogMode(mode);
    if (mode === "edit" && page) {
      const fullPage = pages.find((p) => p.id === page.id);
      setEditingPage(fullPage ?? null);
    } else {
      setEditingPage(null);
    }
    setPageDialogOpen(true);
  };

  const closePageDialog = () => {
    setPageDialogOpen(false);
  };

  const handleDeletePage = (page: Page) => {
    confirmDialog.openWithPayload({
      title: "Delete Page",
      description: (
        <>
          Are you sure you want to delete <strong>{page.title}</strong>? All
          versions will also be deleted. This action cannot be undone.
        </>
      ),
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        await deletePageMutation.mutateAsync({ id: page.id });
      },
    });
  };

  const handlePageSubmit = async (data: {
    title: string;
    slug: string;
    url: string;
    isDefault: boolean;
  }) => {
    if (pageDialogMode === "create") {
      await upsertPageMutation.mutateAsync({ siteId, ...data });
    } else if (editingPage) {
      await upsertPageMutation.mutateAsync({
        id: editingPage.id,
        siteId,
        ...data,
      });
    }
  };

  // Version handlers
  const openVersionDialog = (
    mode: "create" | "edit",
    version?: BaseVersion
  ) => {
    setVersionDialogMode(mode);
    if (mode === "edit" && version) {
      const fullVersion = versions.find((v) => v.id === version.id);
      setEditingVersion(fullVersion as Version | null);
    } else {
      setEditingVersion(null);
    }
    setVersionDialogOpen(true);
  };

  const closeVersionDialog = () => {
    setVersionDialogOpen(false);
  };

  const handleDeleteVersion = (version: BaseVersion) => {
    confirmDialog.openWithPayload({
      title: "Delete Version",
      description:
        "Are you sure you want to delete this version? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        await deleteVersionMutation.mutateAsync({ id: version.id });
      },
    });
  };

  const handleVersionSubmit = async (data: {
    versionDate: Date;
    versionNote?: string;
  }) => {
    if (!activePageId) return;

    if (versionDialogMode === "create") {
      await upsertVersionMutation.mutateAsync({
        pageId: activePageId,
        versionDate: data.versionDate,
        versionNote: data.versionNote,
      });
    } else if (editingVersion) {
      await upsertVersionMutation.mutateAsync({
        id: editingVersion.id,
        pageId: activePageId,
        versionDate: data.versionDate,
        versionNote: data.versionNote,
      });
    }
  };

  const handleVersionFormChange = (data: Partial<Version>) => {
    if (!(activeVersionId && activePageId)) return;
    upsertVersionMutation.mutate({
      id: activeVersionId,
      pageId: activePageId,
      ...data,
      versionNote: data.versionNote ?? undefined,
    });
  };

  // Map versions for display with proper date objects
  const displayVersions: Version[] = versions.map((v) => ({
    ...v,
    versionDate: new Date(v.versionDate),
  }));

  const value: SiteEditContextType = {
    // Site data
    siteId,
    site: site
      ? {
          id: site.id,
          title: site.title,
          slug: site.slug ?? "",
          description: site.description ?? "",
          logo: site.logo ?? "",
          url: site.url,
          tagIds: site.tagIds ?? [],
          rating: site.rating ?? 0,
          isPinned: site.isPinned,
        }
      : null,
    isLoading,

    // Site editing
    form,
    isEditingSite,
    isSavingSite: upsertSiteMutation.isPending,
    startEditSite,
    cancelEditSite,

    // Pages
    pages: sortedPages,
    activePageId,
    setActivePageId: (id) => {
      setActivePageId(id);
      setActiveVersionId(null);
    },

    // Page dialog
    pageDialogOpen,
    pageDialogMode,
    editingPage,
    openPageDialog,
    closePageDialog,
    handlePageSubmit,
    handleDeletePage,
    isPageSubmitting: upsertPageMutation.isPending,

    // Versions
    versions: displayVersions,
    versionsLoading,
    activeVersionId,
    setActiveVersionId,

    // Version dialog
    versionDialogOpen,
    versionDialogMode,
    editingVersion,
    openVersionDialog,
    closeVersionDialog,
    handleVersionSubmit,
    handleDeleteVersion,
    handleVersionFormChange,
    isVersionSubmitting: upsertVersionMutation.isPending,
  };

  return (
    <SiteEditContext.Provider value={value}>
      {children}
    </SiteEditContext.Provider>
  );
}
