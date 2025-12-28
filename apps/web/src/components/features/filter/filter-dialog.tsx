import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { orpc } from "@/lib/orpc";
import { filterDialog, submitSiteDialog } from "@/lib/sheets";
import { FilterBrowseTabs } from "./filter-browse-tabs";
import { FilterEmptyResults } from "./filter-empty-results";
import { FilterRecentSearches } from "./filter-recent-searches";
import { FilterSearchInput } from "./filter-search-input";
import { FilterSearchResults } from "./filter-search-results";

const RECENT_SEARCHES_KEY = "filter-recent-searches";
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_MS = 300;

type FilterPayload =
  | {
      initialQuery?: string;
      initialTags?: string[];
    }
  | undefined;

export function FilterDialog() {
  return (
    <Dialog<FilterPayload> handle={filterDialog}>
      {({ payload }) => (
        <DialogContent
          className="flex h-[80vh] max-h-150 flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl"
          showCloseButton={false}
        >
          <FilterDialogContent payload={payload} />
        </DialogContent>
      )}
    </Dialog>
  );
}

interface FilterDialogContentProps {
  payload: FilterPayload | undefined;
}

function FilterDialogContent({ payload }: FilterDialogContentProps) {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState(payload?.initialQuery ?? "");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Initialize with payload
  useEffect(() => {
    if (payload?.initialQuery) {
      setSearchValue(payload.initialQuery);
      setDebouncedValue(payload.initialQuery);
    }
  }, [payload?.initialQuery]);

  // Debounced search value update
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Search query
  const { data: searchResults, isLoading } = useQuery({
    ...orpc.app.filter.search.queryOptions({
      input: { q: debouncedValue, limit: 10 },
    }),
    enabled: debouncedValue.length > 0,
  });

  // Save to recent searches
  const saveRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove from recent searches
  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== query);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handle tag click
  const handleTagClick = useCallback(
    (tagValue: string) => {
      saveRecentSearch(tagValue);
      filterDialog.close();
      navigate({
        to: "/",
        search: (prev) => ({ ...prev, tag: tagValue }),
      });
    },
    [navigate, saveRecentSearch]
  );

  // Handle site click
  const handleSiteClick = useCallback(
    (siteSlug: string) => {
      if (searchValue) {
        saveRecentSearch(searchValue);
      }
      filterDialog.close();
      navigate({ to: "/$siteSlug", params: { siteSlug } });
    },
    [navigate, saveRecentSearch, searchValue]
  );

  // Handle submit site (empty results)
  const handleSubmitSite = useCallback(() => {
    filterDialog.close();
    submitSiteDialog.openWithPayload(undefined);
  }, []);

  const hasSearchValue = debouncedValue.length > 0;
  const hasResults = useMemo(
    () =>
      searchResults &&
      (searchResults.tags.length > 0 || searchResults.sites.length > 0),
    [searchResults]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Search Input */}
      <div className="shrink-0 border-b p-4">
        <FilterSearchInput
          onChange={setSearchValue}
          onSubmit={() => saveRecentSearch(searchValue)}
          value={searchValue}
        />
      </div>

      {/* Content Area */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {hasSearchValue ? (
          <ScrollArea className="h-full">
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="i-hugeicons-loading-01 size-6 animate-spin text-muted-foreground" />
                </div>
              ) : hasResults ? (
                <FilterSearchResults
                  onSiteClick={handleSiteClick}
                  onTagClick={handleTagClick}
                  sites={searchResults?.sites ?? []}
                  tags={searchResults?.tags ?? []}
                />
              ) : (
                <FilterEmptyResults onSubmitSite={handleSubmitSite} />
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full flex-col p-4">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <FilterRecentSearches
                className="shrink-0"
                onRemove={removeRecentSearch}
                onSelect={(query) => {
                  setSearchValue(query);
                  setDebouncedValue(query);
                }}
                searches={recentSearches}
              />
            )}

            {/* Browse Tabs - handles its own scrolling */}
            <FilterBrowseTabs
              className="min-h-0 flex-1"
              onSiteClick={handleSiteClick}
              onTagClick={handleTagClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}
