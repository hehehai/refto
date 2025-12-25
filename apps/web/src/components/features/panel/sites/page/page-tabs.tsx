import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export interface Page {
  id: string;
  title: string;
  slug: string;
  url: string;
  isDefault: boolean;
}

interface PageTabsProps {
  pages: Page[];
  activePageId: string | null;
  onPageSelect: (pageId: string) => void;
  onAddPage: () => void;
  onEditPage: (page: Page) => void;
  onDeletePage: (page: Page) => void;
  disabled?: boolean;
}

export function PageTabs({
  pages,
  activePageId,
  onPageSelect,
  onAddPage,
  onEditPage,
  onDeletePage,
  disabled = false,
}: PageTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b px-1.5">
      <div className="flex flex-1 items-center gap-2 overflow-x-auto py-1.5">
        {pages.map((page) => (
          <ButtonGroup key={page.id}>
            <Button
              className="gap-1"
              disabled={disabled}
              onClick={() => onPageSelect(page.id)}
              variant={activePageId === page.id ? "default" : "secondary"}
            >
              <span className="max-w-80 truncate">{page.title}</span>
              {page.isDefault && (
                <span className="i-hugeicons-star-award-02 size-3.5" />
              )}
            </Button>

            {/* Edit/Delete icons on hover */}
            {!disabled && (
              <>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPage(page);
                  }}
                  size="icon"
                  variant={activePageId === page.id ? "default" : "secondary"}
                >
                  <span className="i-hugeicons-edit-02 size-3" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(page);
                  }}
                  size="icon"
                  variant={activePageId === page.id ? "default" : "secondary"}
                >
                  <span className="i-hugeicons-delete-03 size-3" />
                </Button>
              </>
            )}
          </ButtonGroup>
        ))}
      </div>

      {/* Add Page button */}
      <div className="flex shrink-0 items-center gap-2 py-1.5">
        <Button
          className="shrink-0 gap-1"
          disabled={disabled}
          onClick={onAddPage}
          variant="secondary"
        >
          <span className="i-hugeicons-plus-sign size-3.5" />
          Add Page
        </Button>
      </div>
    </div>
  );
}
