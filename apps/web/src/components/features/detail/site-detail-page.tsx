import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createMarkerSlugEntries,
  type MarkerSlugEntry,
  sortMarkers,
} from "@/lib/markers";
import { orpc } from "@/lib/orpc";
import { MarkerRefsPanel } from "./marker-refs-panel";
import { RelatedSites } from "./related-sites";
import { SiteHero } from "./site-hero";
import { SitePageHeader } from "./site-page-header";
import { VersionShortcuts } from "./version-shortcuts";
import { VersionViewer } from "./version-viewer";

const HASH_PREFIX = /^#/;

interface SiteDetailPageProps {
  siteSlug: string;
  pageSlug?: string;
  versionSlug?: string;
  panel?: "record" | "refs";
}

export function SiteDetailPage({
  siteSlug,
  pageSlug,
  versionSlug,
  panel,
}: SiteDetailPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [detailTab, setDetailTab] = useState<"record" | "refs">(
    panel === "refs" ? "refs" : "record"
  );
  const [liked, setLiked] = useState<boolean | null>(null);
  const [isMarkerSelectionMode, setIsMarkerSelectionMode] = useState(false);
  const [selectedMarkerIds, setSelectedMarkerIds] = useState<string[]>([]);
  const [markerRefsColumns, setMarkerRefsColumns] = useState<2 | 3>(3);
  const downloadSelectedMarkersRef = useRef<(() => void) | null>(null);

  // Fetch version data by slug
  const { data } = useSuspenseQuery(
    orpc.app.site.getVersionBySlug.queryOptions({
      input: { siteSlug, pageSlug, versionSlug },
    })
  );

  const { site, currentPage, currentVersion, liked: initialLiked } = data;

  // Fetch related sites
  const { data: relatedSites = [] } = useSuspenseQuery(
    orpc.app.site.getRelatedSites.queryOptions({
      input: { siteId: site.id, limit: 6 },
    })
  );

  type MarkerListResult = Awaited<ReturnType<typeof orpc.app.marker.list.call>>;
  const markersQueryOptions = currentVersion
    ? orpc.app.marker.list.queryOptions({
        input: { versionId: currentVersion.id },
      })
    : {
        queryKey: ["markers", "empty"],
        queryFn: async (): Promise<MarkerListResult> => [],
      };
  const { data: markers = [] } = useSuspenseQuery(markersQueryOptions);
  const showDetailTabs = markers.length > 0;
  const orderedMarkers = useMemo(() => sortMarkers(markers), [markers]);
  const markerSlugEntries: MarkerSlugEntry[] = useMemo(
    () => createMarkerSlugEntries(orderedMarkers, { preSorted: true }),
    [orderedMarkers]
  );
  const markerSlugById = useMemo(
    () => new Map(markerSlugEntries.map((entry) => [entry.id, entry.slug])),
    [markerSlugEntries]
  );
  const markerIdBySlug = useMemo(
    () => new Map(markerSlugEntries.map((entry) => [entry.slug, entry.id])),
    [markerSlugEntries]
  );
  const markerHash = location.hash.replace(HASH_PREFIX, "");
  const focusMarkerTime = useMemo(() => {
    if (!markerHash) return null;
    const id = markerIdBySlug.get(markerHash);
    if (!id) return null;
    return orderedMarkers.find((marker) => marker.id === id)?.time ?? null;
  }, [markerHash, markerIdBySlug, orderedMarkers]);

  useEffect(() => {
    if (!showDetailTabs && detailTab === "refs") {
      setDetailTab("record");
    }
  }, [showDetailTabs, detailTab]);

  useEffect(() => {
    const requestedTab = panel === "refs" ? "refs" : "record";
    if (requestedTab === "refs" && !showDetailTabs) {
      if (detailTab !== "record") {
        setDetailTab("record");
      }
      if (panel === "refs") {
        navigate({
          to: location.pathname,
          search: (prev) => ({ ...prev, panel: undefined }),
          replace: true,
        });
      }
      return;
    }
    if (requestedTab !== detailTab) {
      setDetailTab(requestedTab);
    }
  }, [detailTab, location.pathname, navigate, panel, showDetailTabs]);

  useEffect(() => {
    if (!markerHash) return;
    if (detailTab !== "record") {
      setDetailTab("record");
      navigate({
        to: location.pathname,
        search: (prev) => ({ ...prev, panel: undefined }),
        replace: true,
      });
    }
  }, [detailTab, location.pathname, markerHash, navigate]);

  // Use local liked state if available, otherwise use from API
  const isLiked = liked ?? initialLiked;

  const handleLikeChange = (newLiked: boolean) => {
    setLiked(newLiked);
  };

  useEffect(() => {
    setSelectedMarkerIds((prev) =>
      prev.filter((markerId) =>
        orderedMarkers.some((marker) => marker.id === markerId)
      )
    );
  }, [orderedMarkers]);

  useEffect(() => {
    if (detailTab !== "refs" || markers.length === 0) {
      setIsMarkerSelectionMode(false);
      setSelectedMarkerIds([]);
    }
  }, [detailTab, markers.length]);

  const handleToggleMarkerSelectionMode = useCallback(() => {
    setIsMarkerSelectionMode((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedMarkerIds([]);
      }
      return next;
    });
  }, []);
  const handleDetailTabChange = useCallback(
    (tab: "record" | "refs") => {
      if (tab === "refs" && !showDetailTabs) return;
      setDetailTab(tab);
      navigate({
        to: location.pathname,
        search: (prev) => ({
          ...prev,
          panel: tab === "refs" ? "refs" : undefined,
        }),
        replace: true,
      });
    },
    [location.pathname, navigate, showDetailTabs]
  );
  const handleMarkerSelect = useCallback(
    (markerId: string) => {
      const slug = markerSlugById.get(markerId);
      if (!slug) return;
      navigate({
        to: location.pathname,
        search: (prev) => ({ ...prev, panel: undefined }),
        hash: slug,
        replace: true,
      });
    },
    [location.pathname, markerSlugById, navigate]
  );

  const handleToggleMarkerRefsColumns = useCallback(() => {
    setMarkerRefsColumns((prev) => (prev === 3 ? 2 : 3));
  }, []);

  // Navigation handlers using slugs
  const handlePageChange = (pageId: string) => {
    const selectedPage = site.pages.find((p) => p.id === pageId);
    if (selectedPage) {
      setLiked(null);
      navigate({
        to: "/$siteSlug/$pageSlug",
        params: { siteSlug: site.slug, pageSlug: selectedPage.slug },
      });
    }
  };

  const handleVersionChange = (versionId: string) => {
    if (!currentPage) return;
    const version = currentPage.versions.find((v) => v.id === versionId);
    if (version) {
      const versionDateSlug = format(version.versionDate, "yyyy-MM-dd");
      setLiked(null);
      navigate({
        to: "/$siteSlug/$pageSlug/$versionSlug",
        params: {
          siteSlug: site.slug,
          pageSlug: currentPage.slug,
          versionSlug: versionDateSlug,
        },
      });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Site Hero */}
      <SiteHero site={site} />

      {/* Page Tabs and Version Select */}
      <SitePageHeader
        activeDetailTab={detailTab}
        currentPageId={currentPage?.id ?? ""}
        currentVersionId={currentVersion?.id ?? ""}
        isMarkerSelectionMode={isMarkerSelectionMode}
        liked={isLiked}
        markerRefsColumns={markerRefsColumns}
        markersCount={markers.length}
        onDetailTabChange={handleDetailTabChange}
        onDownloadSelectedMarkers={() => downloadSelectedMarkersRef.current?.()}
        onLikeChange={handleLikeChange}
        onPageChange={handlePageChange}
        onToggleMarkerRefsColumns={handleToggleMarkerRefsColumns}
        onToggleMarkerSelectionMode={
          markers.length > 0 ? handleToggleMarkerSelectionMode : undefined
        }
        onVersionChange={handleVersionChange}
        pages={site.pages}
        selectedMarkerCount={selectedMarkerIds.length}
        showDetailTabs={showDetailTabs}
      />

      {/* Version Viewer */}
      {currentVersion && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            {detailTab === "record" ? (
              <div className="w-full">
                <VersionViewer
                  className="relative rounded-2xl bg-muted/50 p-18"
                  focusMarkerTime={focusMarkerTime ?? undefined}
                  markers={orderedMarkers.map((marker) => ({
                    id: marker.id,
                    time: marker.time,
                    text: marker.text,
                  }))}
                  onMarkerSelect={handleMarkerSelect}
                  showMarkers={markers.length > 0}
                  showShortcuts
                  version={currentVersion}
                />
                {currentVersion.webRecord && (
                  <div className="mt-3 py-5 text-center text-muted-foreground text-xs">
                    <VersionShortcuts />
                  </div>
                )}
              </div>
            ) : (
              <MarkerRefsPanel
                columns={markerRefsColumns}
                coverUrl={currentVersion.webCover}
                downloadSelectedMarkersRef={downloadSelectedMarkersRef}
                isSelectionMode={isMarkerSelectionMode}
                markers={orderedMarkers.map((marker) => ({
                  id: marker.id,
                  time: marker.time,
                  text: marker.text,
                }))}
                onSelectedMarkersChange={setSelectedMarkerIds}
                pageTitle={currentPage?.title}
                selectedMarkerIds={selectedMarkerIds}
                siteTitle={site.title}
                videoUrl={currentVersion.webRecord}
              />
            )}
          </div>
        </section>
      )}

      {/* Related Sites */}
      {relatedSites.length > 0 && <RelatedSites sites={relatedSites} />}
    </div>
  );
}
