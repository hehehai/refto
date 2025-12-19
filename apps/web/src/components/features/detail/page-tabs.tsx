import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Page {
  id: string;
  title: string;
  url: string;
  versions: {
    id: string;
    versionDate: Date;
    versionNote?: string | null;
  }[];
}

interface PageTabsProps {
  pages: Page[];
  currentPageId: string;
  currentVersionId: string;
  onPageChange: (pageId: string) => void;
  onVersionChange: (versionId: string) => void;
}

export function PageTabs({
  pages,
  currentPageId,
  currentVersionId,
  onPageChange,
  onVersionChange,
}: PageTabsProps) {
  const currentPage = pages.find((p) => p.id === currentPageId);

  // Format date for display
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Handle version change with null check
  const handleVersionChange = (value: string | null) => {
    if (value) {
      onVersionChange(value);
    }
  };

  return (
    <div className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        {/* Page tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {pages.map((page) => (
            <button
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors",
                page.id === currentPageId
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
              key={page.id}
              onClick={() => onPageChange(page.id)}
              type="button"
            >
              {page.title}
            </button>
          ))}
        </div>

        {/* Version select */}
        {currentPage && currentPage.versions.length > 0 && (
          <Select onValueChange={handleVersionChange} value={currentVersionId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentPage.versions.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  {formatDate(version.versionDate)}
                  {version.versionNote && ` - ${version.versionNote}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
