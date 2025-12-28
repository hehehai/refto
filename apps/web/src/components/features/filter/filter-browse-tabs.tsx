import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
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

  // Trending data query
  const { data: trendingData } = useQuery(
    orpc.app.filter.getTrendingData.queryOptions({
      input: { sitesLimit: 6, tagsLimit: 6 },
    })
  );

  // Tags by type query (only when non-trending tab is active)
  const { data: tagsByType } = useQuery({
    ...orpc.app.filter.getTagsByType.queryOptions({
      input: { type: activeTab as "category" | "section" | "style" },
    }),
    enabled: activeTab !== "trending",
  });

  return (
    <Tabs
      className={cn("flex gap-6", className)}
      onValueChange={(v) => setActiveTab(v as TabValue)}
      orientation="vertical"
      value={activeTab}
    >
      {/* Left Navigation */}
      <div className="flex h-auto w-40 shrink-0 flex-col">
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
      </div>

      {/* Right Content */}
      <ScrollArea className="min-h-0 min-w-0 flex-1">
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
              onTagClick={onTagClick}
              tags={tagsByType ?? []}
              type={tab.value as "category" | "section" | "style"}
            />
          </TabsContent>
        ))}
      </ScrollArea>
    </Tabs>
  );
}
