import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
import type { FilterTag } from "./filter-tags-tab";
import { FilterTagsTab } from "./filter-tags-tab";
import { FilterTrendingTab } from "./filter-trending-tab";

type TabValue = "trending" | "category" | "section" | "style";

const TABS: { value: TabValue; label: string; icon: string }[] = [
  {
    value: "trending",
    label: "Trending",
    icon: "i-hugeicons-chart-breakout-square",
  },
  { value: "category", label: "Categories", icon: "i-hugeicons-folder-01" },
  { value: "section", label: "Sections", icon: "i-hugeicons-layout-grid" },
  { value: "style", label: "Styles", icon: "i-hugeicons-paint-brush-01" },
];

interface FilterBrowseTabsProps {
  onTagClick: (tagValue: string) => void;
  onSiteClick: (siteSlug: string) => void;
  className?: string;
}

export function FilterBrowseTabs({
  onTagClick,
  onSiteClick,
  className,
}: FilterBrowseTabsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("trending");
  const [hoveredTag, setHoveredTag] = useState<Pick<
    FilterTag,
    "id" | "name" | "tipMedia"
  > | null>(null);

  // Trending data query
  const { data: trendingData } = useQuery(
    orpc.app.filter.getTrendingData.queryOptions({
      input: { sitesLimit: 6, tagsLimit: 6 },
    })
  );

  // Tags by type query (only when non-trending tab is active)
  const { data: tagsByType, isLoading: isLoadingTags } = useQuery({
    ...orpc.app.filter.getTagsByType.queryOptions({
      input: { type: activeTab as "category" | "section" | "style" },
    }),
    enabled: activeTab !== "trending",
  });

  const handleTagHover = useCallback(
    (tag: Pick<FilterTag, "id" | "name" | "tipMedia"> | null) => {
      if (tag?.tipMedia) {
        setHoveredTag(tag);
      } else {
        setHoveredTag(null);
      }
    },
    []
  );

  const previewMedia = hoveredTag?.tipMedia ?? null;
  const isVideoPreview =
    typeof previewMedia === "string" && previewMedia.includes("video");

  return (
    <Tabs
      className={cn("flex gap-6", className)}
      onValueChange={(v) => {
        setActiveTab(v as TabValue);
        setHoveredTag(null);
      }}
      orientation="vertical"
      value={activeTab}
    >
      {/* Left Navigation */}
      <div className="flex h-full w-40 shrink-0 flex-col">
        <TabsList className="flex h-auto w-full shrink-0 flex-col items-stretch gap-1 bg-transparent p-0">
          {TABS.map((tab) => (
            <TabsTrigger
              className="justify-start gap-2 px-3 py-2 text-foreground hover:bg-muted data-active:bg-muted group-data-[variant=default]/tabs-list:data-active:shadow-none"
              key={tab.value}
              value={tab.value}
            >
              <span className={cn(tab.icon, "size-4")} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-auto flex flex-col gap-3 text-muted-foreground text-xs">
          {previewMedia && (
            <div className="space-y-2">
              <div className="overflow-hidden rounded-xl border bg-muted/20">
                {isVideoPreview ? (
                  <video
                    autoPlay
                    className="h-28 w-full object-cover"
                    loop
                    muted
                    playsInline
                    src={previewMedia}
                  />
                ) : (
                  <img
                    alt={hoveredTag?.name ?? "Tag media preview"}
                    className="h-28 w-full object-cover"
                    src={previewMedia}
                  />
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <KbdGroup>
              <Kbd>
                <span className="i-hugeicons-keyboard size-4" />
              </Kbd>
              <Kbd>⌘ + K</Kbd>
            </KbdGroup>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <ScrollArea className="h-115.5 min-h-0 min-w-0 flex-1">
        <TabsContent className="mt-0" value="trending">
          <FilterTrendingTab
            data={trendingData}
            onSiteClick={onSiteClick}
            onTagClick={onTagClick}
          />
        </TabsContent>
        {TABS.filter((tab) => tab.value !== "trending").map((tab) => (
          <TabsContent className="mt-0" key={tab.value} value={tab.value}>
            <FilterTagsTab
              isLoading={isLoadingTags}
              onTagClick={onTagClick}
              onTagHover={handleTagHover}
              tags={tagsByType ?? []}
              type={tab.value as "category" | "section" | "style"}
            />
          </TabsContent>
        ))}
      </ScrollArea>
    </Tabs>
  );
}
