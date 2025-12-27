import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

type TagType = "category" | "section" | "style";
type FilterType = "all" | TagType;

interface TagSelectProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
  type?: TagType;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const TAG_TYPE_LABELS: Record<TagType, string> = {
  category: "Category",
  section: "Section",
  style: "Style",
};

const TAG_TYPE_VARIANTS: Record<TagType, "default" | "secondary" | "outline"> =
  {
    category: "default",
    section: "secondary",
    style: "outline",
  };

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "category", label: "Category" },
  { value: "section", label: "Section" },
  { value: "style", label: "Style" },
];

export function TagSelect({
  value,
  onChange,
  type,
  disabled = false,
  placeholder = "Select tags...",
  className,
}: TagSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Use prop type if provided, otherwise use filterType state
  const queryType = type ?? (filterType === "all" ? undefined : filterType);

  const { data: tags, isLoading } = useQuery(
    orpc.panel.tag.listForSelect.queryOptions({
      input: { search: search || undefined, type: queryType, limit: 100 },
    })
  );

  // Get selected tags info
  const selectedTags = useMemo(() => {
    if (!tags) return [];
    return tags.filter((tag) => value.includes(tag.id));
  }, [tags, value]);

  // Group tags by type (only used when filterType is "all" and no type prop)
  const groupedTags = useMemo(() => {
    if (!tags) return { category: [], section: [], style: [] };
    const groups: Record<TagType, typeof tags> = {
      category: [],
      section: [],
      style: [],
    };
    for (const tag of tags) {
      groups[tag.type].push(tag);
    }
    return groups;
  }, [tags]);

  // Focus input when popover opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleToggle = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleRemoveTag = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    onChange(value.filter((id) => id !== tagId));
  };

  // Show tabs only when type prop is not provided
  const showTabs = !type;

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-expanded={open}
            className={cn(
              "h-auto min-h-9 w-full justify-between px-3 py-1.5",
              className
            )}
            disabled={disabled}
            role="combobox"
            variant="outline"
          >
            <div className="flex flex-1 flex-wrap gap-1">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <Badge
                    className="gap-1 pr-1"
                    key={tag.id}
                    variant={TAG_TYPE_VARIANTS[tag.type]}
                  >
                    {tag.name}
                    <span
                      className="i-hugeicons-cancel-01 size-3 cursor-pointer opacity-50 hover:opacity-100"
                      onClick={(e) => handleRemoveTag(e, tag.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleRemoveTag(
                            e as unknown as React.MouseEvent,
                            tag.id
                          );
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    />
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            {value.length > 0 ? (
              <span
                className="i-hugeicons-cancel-01 ml-2 size-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClear(e as unknown as React.MouseEvent);
                  }
                }}
                role="button"
                tabIndex={0}
              />
            ) : (
              <span className="i-hugeicons-unfold-more ml-2 size-4 shrink-0 opacity-50" />
            )}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-72 gap-0 p-0">
        {/* Search Input */}
        <div className="flex items-center border-b px-3">
          <span className="i-hugeicons-search-01 size-4 shrink-0 opacity-50" />
          <Input
            className="h-9 border-0 px-2 shadow-none focus-visible:ring-0"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            ref={inputRef}
            value={search}
          />
        </div>

        {/* Filter Tabs */}
        {showTabs && (
          <div className="flex gap-1 border-b p-1">
            {FILTER_TABS.map((tab) => (
              <button
                className={cn(
                  "flex-1 rounded-md px-2 py-1 font-medium text-xs transition-colors",
                  filterType === tab.value
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* List */}
        <ScrollArea className="h-72 overflow-hidden">
          <div className="p-1">
            {/* Loading state */}
            {isLoading && (
              <div className="py-6 text-center text-muted-foreground text-sm">
                Loading...
              </div>
            )}

            {/* Empty state */}
            {!isLoading && (!tags || tags.length === 0) && (
              <div className="py-6 text-center text-muted-foreground text-sm">
                No tags found.
              </div>
            )}

            {/* Tag list */}
            {!isLoading &&
              tags &&
              tags.length > 0 &&
              (queryType
                ? // If type is specified (via prop or filter), show flat list
                  tags.map((tag) => (
                    <TagItem
                      isSelected={value.includes(tag.id)}
                      key={tag.id}
                      onToggle={() => handleToggle(tag.id)}
                      tag={tag}
                    />
                  ))
                : // Otherwise show grouped list (only when filterType is "all")
                  (["category", "section", "style"] as TagType[]).map(
                    (tagType) =>
                      groupedTags[tagType]?.length > 0 && (
                        <div key={tagType}>
                          <div className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
                            {TAG_TYPE_LABELS[tagType]}
                          </div>
                          {groupedTags[tagType].map((tag) => (
                            <TagItem
                              isSelected={value.includes(tag.id)}
                              key={tag.id}
                              onToggle={() => handleToggle(tag.id)}
                              tag={tag}
                            />
                          ))}
                        </div>
                      )
                  ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

interface TagItemProps {
  tag: {
    id: string;
    name: string;
    value: string;
    type: TagType;
    description: string | null;
    tipMedia: string | null;
  };
  isSelected: boolean;
  onToggle: () => void;
}

function TagItem({ tag, isSelected, onToggle }: TagItemProps) {
  return (
    <button
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent/50"
      )}
      onClick={onToggle}
      type="button"
    >
      <Checkbox checked={isSelected} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm">{tag.name}</span>
          {tag.tipMedia && (
            <Tooltip>
              <TooltipTrigger>
                <span className="i-hugeicons-image-02 size-3.5 shrink-0 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right">
                {tag.tipMedia.includes("video") ? (
                  <video
                    className="max-h-32 max-w-48 rounded"
                    controls
                    src={tag.tipMedia}
                  />
                ) : (
                  <img
                    alt="Tip"
                    className="max-h-32 max-w-48 rounded"
                    src={tag.tipMedia}
                  />
                )}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {tag.description && (
          <span className="line-clamp-1 text-muted-foreground text-xs">
            {tag.description}
          </span>
        )}
      </div>
    </button>
  );
}
