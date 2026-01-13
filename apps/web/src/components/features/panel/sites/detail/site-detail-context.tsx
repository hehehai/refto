import { skipToken, useQuery } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { orpc } from "@/lib/orpc";
import type { Page } from "../page/page-tabs";
import type { Version as BaseVersion } from "../version/version-tabs";

interface Version extends BaseVersion {
  siteOG: string | null;
  webCover: string;
  webRecord: string | null;
  tagIds: string[];
}

interface Tag {
  id: string;
  name: string;
  value: string;
  type: "category" | "section" | "style";
}

interface Site {
  id: string;
  title: string;
  description: string | null;
  logo: string | null;
  url: string;
  tags: Tag[];
  tagIds: string[];
  rating: number | null;
  isPinned: boolean;
  visits: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
}

interface SiteDetailContextType {
  // Site data
  siteId: string;
  site: Site | null;
  isLoading: boolean;

  // Pages
  pages: Page[];
  activePageId: string | null;
  setActivePageId: (id: string | null) => void;

  // Versions
  versions: Version[];
  versionsLoading: boolean;
  activeVersionId: string | null;
  setActiveVersionId: (id: string | null) => void;
}

const SiteDetailContext = createContext<SiteDetailContextType | null>(null);

export function useSiteDetail() {
  const ctx = useContext(SiteDetailContext);
  if (!ctx)
    throw new Error("useSiteDetail must be used within SiteDetailProvider");
  return ctx;
}

interface SiteDetailProviderProps {
  siteId: string;
  initialPageId?: string;
  open: boolean;
  children: ReactNode;
}

export function SiteDetailProvider({
  siteId,
  initialPageId,
  open,
  children,
}: SiteDetailProviderProps) {
  // Active selections
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

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

  // Auto-select initial page or ensure we always have a valid page selected
  useEffect(() => {
    if (!open || sortedPages.length === 0) return;

    const initialPageExists =
      initialPageId &&
      sortedPages.some((page: Page) => page.id === initialPageId);
    const activePageExists =
      activePageId &&
      sortedPages.some((page: Page) => page.id === activePageId);

    if (initialPageExists && activePageId !== initialPageId) {
      setActivePageId(initialPageId);
      return;
    }

    if (!activePageExists) {
      setActivePageId(sortedPages[0].id);
    }
  }, [open, sortedPages, activePageId, initialPageId]);

  // Auto-select first version when versions change
  useEffect(() => {
    if (versions.length > 0) {
      setActiveVersionId(versions[0].id);
    } else {
      setActiveVersionId(null);
    }
  }, [versions]);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setActivePageId(null);
      setActiveVersionId(null);
    }
  }, [open]);

  // Map versions with proper date objects
  const displayVersions: Version[] = versions.map((v) => ({
    ...v,
    versionDate: new Date(v.versionDate),
  }));

  const value: SiteDetailContextType = {
    siteId,
    site: site
      ? {
          id: site.id,
          title: site.title,
          description: site.description,
          logo: site.logo,
          url: site.url,
          tags: site.tags ?? [],
          tagIds: site.tagIds ?? [],
          rating: site.rating,
          isPinned: site.isPinned,
          visits: site.visits,
          createdAt: new Date(site.createdAt),
          updatedAt: new Date(site.updatedAt),
          createdBy: site.createdBy,
        }
      : null,
    isLoading,
    pages: sortedPages,
    activePageId,
    setActivePageId: (id) => {
      setActivePageId(id);
      setActiveVersionId(null);
    },
    versions: displayVersions,
    versionsLoading,
    activeVersionId,
    setActiveVersionId,
  };

  return (
    <SiteDetailContext.Provider value={value}>
      {children}
    </SiteDetailContext.Provider>
  );
}
