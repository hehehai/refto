import { Button } from "@/components/ui/button";

export interface Page {
  id: string;
  title: string;
  url: string;
  isDefault: boolean;
}

interface PageViewTabsProps {
  pages: Page[];
  activePageId: string | null;
  onPageSelect: (pageId: string) => void;
}

export function PageViewTabs({
  pages,
  activePageId,
  onPageSelect,
}: PageViewTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b px-1.5">
      <div className="flex flex-1 items-center gap-2 overflow-x-auto py-1.5">
        {pages.map((page) => (
          <Button
            className="gap-1"
            key={page.id}
            onClick={() => onPageSelect(page.id)}
            variant={activePageId === page.id ? "default" : "secondary"}
          >
            <span className="max-w-80 truncate">{page.title}</span>
            {page.isDefault && (
              <span className="i-hugeicons-star-award-02 size-3.5" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
